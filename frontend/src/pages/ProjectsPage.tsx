import React, { useState, useEffect } from 'react';
import { Trello, Plus, ShieldAlert, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import api from '../api/axios';

interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    dueDate?: string;
    slaDeadline?: string;
}

interface Project {
    id: string;
    name: string;
}

const ProjectsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Form inputs
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskSlaHours, setNewTaskSlaHours] = useState('24');
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchProjectsAndTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/projects');
            if (res.data?.success) {
                setProjects(res.data.data);
                
                if (res.data.data.length > 0) {
                    const currentProjId = selectedProjectId || res.data.data[0].id;
                    setSelectedProjectId(currentProjId);
                    
                    const activeProj = res.data.data.find((p: any) => p.id === currentProjId);
                    setTasks(activeProj?.tasks || []);
                }
            }
        } catch (error) {
            console.error('Failed to load projects/tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectsAndTasks();
    }, [selectedProjectId]);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !selectedProjectId) return;

        const slaDeadline = new Date(new Date().getTime() + parseInt(newTaskSlaHours) * 60 * 60 * 1000);

        try {
            const res = await api.post(`/projects/${selectedProjectId}/tasks`, {
                title: newTaskTitle,
                description: newTaskDesc,
                status: 'TODO',
                slaDeadline
            });

            if (res.data?.success) {
                setNewTaskTitle('');
                setNewTaskDesc('');
                setShowAddForm(false);
                await fetchProjectsAndTasks();
            }
        } catch (error) {
            console.error('Failed to add task', error);
        }
    };

    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        try {
            const res = await api.patch(`/projects/tasks/${taskId}`, { status: newStatus });
            if (res.data?.success) {
                await fetchProjectsAndTasks();
            }
        } catch (error) {
            console.error('Failed to update task status', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const res = await api.delete(`/projects/tasks/${taskId}`);
            if (res.data?.success) {
                await fetchProjectsAndTasks();
            }
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    // Filters tasks by status
    const getTasksByStatus = (status: string) => {
        return tasks.filter(t => t.status === status);
    };

    // Checks if a task has an urgent SLA limit
    const getSlaUrgency = (slaString?: string) => {
        if (!slaString) return 'none';
        const msRemaining = new Date(slaString).getTime() - new Date().getTime();
        if (msRemaining <= 0) return 'breached';
        if (msRemaining <= 3 * 60 * 60 * 1000) return 'urgent'; // 3 hours
        return 'safe';
    };

    return (
        <div className="space-y-6">
            {/* Header / Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <Trello className="text-emerald-500" /> Workspace Projects Board
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Manage organizational milestones, assign tasks, and monitor SLA status warnings.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="input-field py-2.5 bg-slate-50 dark:bg-slate-900/50 text-xs w-[200px]"
                    >
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn-primary py-2.5 px-4 text-xs font-bold uppercase tracking-wider gap-1.5"
                    >
                        <Plus size={14} /> Task
                    </button>
                </div>
            </div>

            {/* Task Add Form Overlay */}
            {showAddForm && (
                <div className="glass-card p-6 border-slate-200 dark:border-slate-800 bg-slate-900/10 dark:bg-white/5">
                    <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Title</label>
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="e.g. Write multi-tenant logical unit tests"
                                className="input-field py-2.5 bg-white dark:bg-slate-950 text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                            <input
                                type="text"
                                value={newTaskDesc}
                                onChange={(e) => setNewTaskDesc(e.target.value)}
                                placeholder="e.g. Scopes OrganizationId query checks."
                                className="input-field py-2.5 bg-white dark:bg-slate-950 text-xs"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA limit</label>
                                <select
                                    value={newTaskSlaHours}
                                    onChange={(e) => setNewTaskSlaHours(e.target.value)}
                                    className="input-field py-2.5 bg-white dark:bg-slate-950 text-xs"
                                >
                                    <option value="2">2 Hours (Critical)</option>
                                    <option value="24">24 Hours (Normal)</option>
                                    <option value="72">72 Hours (Relaxed)</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider"
                            >
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => {
                    const statusTasks = getTasksByStatus(status);
                    return (
                        <div key={status} className="glass-card p-4 bg-slate-900/10 dark:bg-white/5 border-slate-200 dark:border-slate-800 space-y-4 min-h-[300px]">
                            {/* Column title */}
                            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    {status.replace('_', ' ')}
                                </span>
                                <span className="text-xs font-bold font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-400">
                                    {statusTasks.length}
                                </span>
                            </div>

                            {/* Column cards */}
                            <div className="space-y-3">
                                {statusTasks.map((task) => {
                                    const slaState = getSlaUrgency(task.slaDeadline);
                                    const isCritical = slaState === 'urgent' && status !== 'DONE';
                                    const isBreached = slaState === 'breached' && status !== 'DONE';

                                    return (
                                        <div 
                                            key={task.id}
                                            className={`p-4 bg-white dark:bg-slate-950 border rounded-xl space-y-3 relative group transition-all duration-300 ${
                                                isBreached 
                                                    ? 'border-rose-500 shadow-lg shadow-rose-500/10 bg-rose-500/[0.02]' 
                                                    : isCritical 
                                                        ? 'border-amber-500 shadow-md shadow-amber-500/10 bg-amber-500/[0.02] border-dashed animate-pulse'
                                                        : 'border-slate-200 dark:border-slate-850'
                                            }`}
                                        >
                                            {/* Flash warning header */}
                                            {(isCritical || isBreached) && (
                                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400">
                                                    <ShieldAlert size={12} className="animate-bounce" />
                                                    {isBreached ? 'SLA Breached' : 'SLA Limit Warning'}
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                                    {task.title}
                                                </h4>
                                                {task.description && (
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Footer tools */}
                                            <div className="flex justify-between items-center pt-2.5 border-y border-slate-100 dark:border-slate-900 py-2">
                                                {/* Left status cycler */}
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[9px] font-bold uppercase tracking-wider py-1 px-1.5 focus:outline-none"
                                                >
                                                    <option value="TODO">Todo</option>
                                                    <option value="IN_PROGRESS">Progress</option>
                                                    <option value="REVIEW">Review</option>
                                                    <option value="DONE">Done</option>
                                                </select>

                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="p-1 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete Task"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectsPage;
