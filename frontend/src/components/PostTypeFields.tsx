import React from 'react';

interface PostTypeFieldsProps {
    type: 'general' | 'opportunity' | 'event' | 'achievement' | 'showcase';
    metadata: any;
    setMetadata: (metadata: any) => void;
}

const PostTypeFields: React.FC<PostTypeFieldsProps> = ({ type, metadata, setMetadata }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setMetadata({ ...metadata, [e.target.name]: e.target.value });
    };

    if (type === 'general') return null;

    if (type === 'opportunity') {
        return (
            <div className="grid grid-cols-2 gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Role / Position</label>
                    <input name="role" value={metadata.role || ''} onChange={handleChange} placeholder="e.g. SDE Intern" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                </div>
                <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Company</label>
                    <input name="company" value={metadata.company || ''} onChange={handleChange} placeholder="Google" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                </div>
                <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Location</label>
                    <input name="location" value={metadata.location || ''} onChange={handleChange} placeholder="Remote / City" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Application Link</label>
                    <input name="applyLink" value={metadata.applyLink || ''} onChange={handleChange} placeholder="https://..." className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                </div>
            </div>
        );
    }

    if (type === 'event') {
        return (
            <div className="grid grid-cols-2 gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Event Title</label>
                    <input name="eventTitle" value={metadata.eventTitle || ''} onChange={handleChange} placeholder="Annual Workshop on AI" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
                <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Date</label>
                    <input type="date" name="eventDate" value={metadata.eventDate || ''} onChange={handleChange} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]" />
                </div>
                <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Location / Virtual Link</label>
                    <input name="location" value={metadata.location || ''} onChange={handleChange} placeholder="Zoom / Hall 4" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                </div>
            </div>
        );
    }

    if (type === 'achievement') {
        return (
            <div className="grid grid-cols-2 gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Project / Achievement Name</label>
                    <input name="title" value={metadata.title || ''} onChange={handleChange} placeholder="Won Innovate Hackathon" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Organization / Authority</label>
                    <input name="issuedBy" value={metadata.issuedBy || ''} onChange={handleChange} placeholder="Google / Microsoft / College" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" />
                </div>
            </div>
        );
    }

    if (type === 'showcase') {
        return (
            <div className="grid grid-cols-2 gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Project Title</label>
                    <input name="title" value={metadata.title || ''} onChange={handleChange} placeholder="Allumnova Core" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold" />
                </div>
                <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Looking For / Seeking</label>
                    <input name="lookingFor" value={metadata.lookingFor || ''} onChange={handleChange} placeholder="Designers, Beta Testers..." className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-3 px-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                </div>
            </div>
        );
    }

    return null;
};

export default PostTypeFields;
