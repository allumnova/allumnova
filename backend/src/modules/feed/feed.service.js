const prisma = require('../../models');
const { createClient } = require('redis');
const notificationService = require('../notification/notification.service');
const socketUtil = require('../../utils/socket');
const reputationService = require('../reputation/reputation.service');

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Feed Redis Client Error', err));

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis from Feed Service', err);
    }
})();

/**
 * Calculates a modular feed score based on the PRD formula (40/30/20/10):
 * 1. Engagement (40%) - Weighted Interactions
 * 2. Relevance (30%) - Content Type & Social Proximity
 * 3. Recency (20%) - Time Decay
 * 4. Reputation (10%) - Author Authority
 */
const calculatePostScore = async (post, currentUserId = null) => {
    const { likes, comments, author, createdAt, post_type: type } = post;
    const likesCount = likes?.length || 0;
    const commentsCount = comments?.length || 0;
    const boostCount = (post.metadata || {}).boostCount || 0;

    // 1. Engagement (40%)
    // Weights: Like=1, Comment=2, Boost=10
    const rawEngagementScore = (likesCount * 1) + (commentsCount * 2) + (boostCount * 10);
    const engagementScore = Math.min(rawEngagementScore * 10, 100) * 0.4;

    // 2. Relevance (30%)
    let relevanceScore = 0;
    const typeWeights = {
        opportunity: 10,
        achievement: 7,
        event: 7,
        general: 4
    };
    relevanceScore += (typeWeights[type] || 4);

    // Social Proximity
    if (currentUserId && author.id !== currentUserId) {
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: author.id, status: 'accepted' },
                    { senderId: author.id, receiverId: currentUserId, status: 'accepted' }
                ]
            }
        });
        if (connection) relevanceScore += 10;
    }
    const finalRelevanceScore = Math.min(relevanceScore * 5, 100) * 0.3;

    // 3. Recency (20%)
    const hoursSinceDiscovery = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
    // Exponential decay: e^(-0.1 * hours)
    const recencyFactor = Math.exp(-0.1 * hoursSinceDiscovery);
    const recencyScore = recencyFactor * 100 * 0.2;

    // 4. Reputation (10%)
    const finalReputationScore = Math.min(author.reputationScore || 0, 100) * 0.1;

    // Final Weighted Feed Score
    return engagementScore + finalRelevanceScore + recencyScore + finalReputationScore;
};

const updatePostInFeedCache = async (collegeId, postId) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            author: true,
            media: true,
            likes: true,
            comments: {
                include: {
                    user: { select: { id: true, name: true, avatar: true } }
                }
            }
        }
    });

    if (post) {
        const score = await calculatePostScore(post);
        // Update main feed
        await redisClient.zAdd(`feed:college:${collegeId}`, [{ score, value: postId }]);
        
        // Update type-specific sub-feed
        if (post.post_type && post.post_type !== 'general') {
            await redisClient.zAdd(`feed:college:${collegeId}:type:${post.post_type}`, [{ score, value: postId }]);
        }

        // Update hub-specific feed
        if (post.environmentId) {
            await redisClient.zAdd(`feed:hub:${post.environmentId}`, [{ score, value: postId }]);
            // Broadcast to hub specific room if needed
            socketUtil.sendToRoom(`hub:${post.environmentId}`, 'ranking_update', { postId, score });
        }

        // Broadcast ranking update to the college room
        socketUtil.sendToCollege(collegeId, 'ranking_update', { postId, score });
    }
};

const getPersonalizedFeed = async (collegeId, userId, limit = 20, cursor, type = null, hubId = null) => {
    // Cache Key priority: Hub > Type > Main
    let cacheKey = `feed:college:${collegeId}`;
    if (hubId && hubId !== 'null') {
        cacheKey = `feed:hub:${hubId}`;
    } else if (type && type !== 'null') {
        cacheKey = `feed:college:${collegeId}:type:${type}`;
    }
    
    console.log(`[DEBUG] Feed Request - College: ${collegeId}, User: ${userId}, Hub: ${hubId}, Type: ${type}, CacheKey: ${cacheKey}`);

    let postIds;
    // ... (logic to get postIds from Redis remains same as it uses dynamic cacheKey)
    if (cursor) {
        const rank = await redisClient.zRevRank(cacheKey, cursor);
        if (rank !== null) {
            postIds = await redisClient.zRange(cacheKey, rank + 1, rank + limit, { REV: true });
        } else {
            postIds = [];
        }
    } else {
        postIds = await redisClient.zRange(cacheKey, 0, limit - 1, { REV: true });
    }

    if (postIds.length === 0 && !cursor) {
        const whereClause = { collegeId };
        if (hubId && hubId !== 'null') {
            // Check if user is APPROVED member of this hub
            const membership = await prisma.environmentMembership.findUnique({
                where: { userId_environmentId: { userId, environmentId: hubId } }
            });
            if (!membership || membership.status !== 'APPROVED') {
                return []; // Or some message saying membership required
            }
            whereClause.environmentId = hubId;
        }
        else if (type && type !== 'null') whereClause.post_type = type;

        const posts = await prisma.post.findMany({
            where: whereClause,
            take: 200,
            orderBy: { createdAt: 'desc' },
            include: {
                author: true,
                media: true,
                likes: true,
                comments: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true } }
                    }
                }
            }
        });
        console.log(`[DEBUG] Prisma Found ${posts.length} posts for college ${collegeId}`);

        const activeBatch = [];
        for (const post of posts) {
            try {
                const score = await calculatePostScore(post, userId);
                activeBatch.push({ score, value: post.id });
            } catch (err) {
                console.error(`[ERROR] Failed to calculate score for post ${post.id}`, err);
                activeBatch.push({ score: 0, value: post.id });
            }
        }

        if (activeBatch.length > 0) {
            try {
                await redisClient.zAdd(cacheKey, activeBatch);
                if (type) await redisClient.expire(cacheKey, 3600);
            } catch (err) {
                console.error(`[ERROR] Redis zAdd failed for key ${cacheKey}`, err);
            }
            
            postIds = activeBatch.sort((a, b) => b.score - a.score).slice(0, limit).map(p => p.value);
        }
    }

    const posts = await prisma.post.findMany({
        where: { id: { in: postIds } },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    reputationScore: true,
                    tierLevel: true,
                    is_verified: true
                }
            },
            media: true,
            comments: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, avatar: true } }
                }
            },
            _count: {
                select: { likes: true, comments: true }
            }
        }
    });

    // Sort according to Redis order
    const idMap = postIds.reduce((acc, id, idx) => ({ ...acc, [id]: idx }), {});
    const sortedPosts = posts.sort((a, b) => idMap[a.id] - idMap[b.id]);

    // Enrich with connection status if userId is provided
    if (userId) {
        return await Promise.all(sortedPosts.map(async (post) => {
            if (post.author.id === userId) {
                return { ...post, author: { ...post.author, connectionStatus: { status: 'self' } } };
            }

            const connection = await prisma.connection.findFirst({
                where: {
                    OR: [
                        { senderId: userId, receiverId: post.author.id },
                        { senderId: post.author.id, receiverId: userId }
                    ]
                }
            });

            return {
                ...post,
                author: {
                    ...post.author,
                    connectionStatus: connection ? {
                        status: connection.status,
                        isSender: connection.senderId === userId
                    } : null
                }
            };
        }));
    }

    return sortedPosts;
};

const createPost = async (userId, collegeId, postData) => {
    const { content, metadata } = postData;
    const type = postData.post_type || postData.type || 'general';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const postCount = await prisma.post.count({
        where: { authorId: userId, post_type: type, createdAt: { gte: today } }
    });

    // Relaxed limits for development/premium users while testing
    const limits = {
        general: 20,
        opportunity: 50,
        event: 20,
        achievement: 10
    };

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });

    // Skip check for admins
    if (user.role !== 'admin' && postCount >= (limits[type] || 20)) {
        throw new Error(`Daily limit reached for ${type} posts. Please try again tomorrow.`);
    }

    const post = await prisma.post.create({
        data: { 
            content, 
            post_type: type, 
            authorId: userId, 
            collegeId, 
            metadata,
            media: {
                create: postData.media?.map(m => ({
                    url: m.url,
                    type: m.type || 'image'
                })) || []
            }
        },
        include: { author: true, media: true }
    });

    await updatePostInFeedCache(collegeId, post.id);

    // Notify college members of new post
    socketUtil.sendToCollege(collegeId, 'new_post', {
        id: post.id,
        author: post.author.name,
        type: post.post_type
    });

    return post;
};

const interact = async (userId, postId, type, content = null) => {
    let interaction;
    if (type === 'appreciate') {
        interaction = await prisma.postLike.create({
            data: { userId, postId },
            include: { post: { include: { author: true } } }
        });
    } else if (type === 'discuss') {
        interaction = await prisma.comment.create({
            data: { userId, postId, content },
            include: { 
                user: { select: { id: true, name: true, avatar: true } },
                post: { include: { author: true } } 
            }
        });
    } else if (type === 'boost') {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new Error('Post not found');
        
        const metadata = typeof post.metadata === 'object' ? post.metadata : {};
        interaction = await prisma.post.update({
            where: { id: postId },
            data: {
                metadata: {
                    ...metadata,
                    boostCount: ((metadata || {}).boostCount || 0) + 1
                }
            },
            include: { author: true }
        });
        interaction = { ...interaction, post: interaction };
    }

    if (!interaction) throw new Error('Invalid interaction type');

    const reputationPoints = { appreciate: 2, boost: 10, discuss: 5 };
    await reputationService.updateReputation(interaction.post.authorId, reputationPoints[type] || 0);

    // Update post score in Redis
    try {
        await updatePostInFeedCache(interaction.post.collegeId, postId);
    } catch (err) {
        console.error('Failed to update feed cache after interaction', err);
    }

    // Trigger Notification for the author
    if (interaction.post.authorId !== userId) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        const descriptions = {
            appreciate: 'appreciated your post',
            discuss: 'commented on your post',
            boost: 'boosted your post'
        };

        await notificationService.createNotification(interaction.post.authorId, type, {
            reference_id: postId,
            actorId: userId,
            triggerUser: user.name,
            message: `${user.name} ${descriptions[type] || 'interacted with your post'}`
        });
    }

    return interaction;
};

const updatePost = async (userId, postId, updates) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');
    if (post.authorId !== userId) throw new Error('Unauthorized to edit this post');

    const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
            content: updates.content || post.content,
            metadata: updates.metadata ? { ...(post.metadata || {}), ...updates.metadata } : post.metadata
        },
        include: { 
            author: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    reputationScore: true,
                    tierLevel: true,
                    is_verified: true
                }
            }
        }
    });

    await updatePostInFeedCache(post.collegeId, postId);
    return updatedPost;
};

const deletePost = async (userId, postId) => {
    const post = await prisma.post.findUnique({ 
        where: { id: postId },
        include: { author: true } 
    });
    if (!post) throw new Error('Post not found');

    const isAdmin = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (post.authorId !== userId && isAdmin?.role !== 'admin') {
        throw new Error('Unauthorized to delete this post');
    }

    await prisma.post.delete({ where: { id: postId } });

    // Remove from Redis feeds
    const cacheKey = `feed:college:${post.collegeId}`;
    await redisClient.zRem(cacheKey, postId);
    if (post.post_type && post.post_type !== 'general') {
        await redisClient.zRem(`${cacheKey}:type:${post.post_type}`, postId);
    }

    return { success: true };
};

const reportPost = async (reporterId, postId, reason) => {
    return await prisma.report.create({
        data: {
            reporterId,
            content_type: 'post',
            content_id: postId,
            reason
        }
    });
};

module.exports = {
    getPersonalizedFeed,
    createPost,
    interact,
    updatePost,
    deletePost,
    reportPost
};
