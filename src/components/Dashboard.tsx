'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Search, RefreshCw } from 'lucide-react';
import { getLeaderboard } from '../lib/firebase';

const Dashboard = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        setLoading(true);
        const data = await getLeaderboard();
        setEvaluations(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return "Desconocida";
        // Handle Firebase object timestamp or standard JS Date if Mocked
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('es-MX', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 mb-20 animate-in slide-in-from-bottom-8">
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                        Leaderboard Académico
                    </h2>
                    <p className="text-slate-400 font-medium tracking-wide">Registro global de culminación del ensayo</p>
                </div>
                <button 
                    onClick={fetchLeaderboard}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-full hover:bg-slate-800 transition-colors text-slate-300"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/80 border-b border-slate-800">
                                <th className="p-5 font-bold text-slate-400 uppercase tracking-widest text-xs">Alumno</th>
                                <th className="p-5 font-bold text-slate-400 uppercase tracking-widest text-xs">Terminación (Hora/Día)</th>
                                <th className="p-5 font-bold text-slate-400 uppercase tracking-widest text-xs text-right">Puntuación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-500 font-medium">Sincronizando con el Logos...</td>
                                </tr>
                            ) : evaluations.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-500 font-medium">Aún no hay cadetes registrados en el Logos.</td>
                                </tr>
                            ) : (
                                evaluations.map((ev, i) => (
                                    <tr key={ev.id || i} className="hover:bg-indigo-900/10 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-emerald-400 shadow-inner">
                                                    {ev.nombre?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <span className="font-bold text-slate-200">{ev.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Clock size={16} className="text-slate-500" />
                                                {formatDate(ev.createdAt)}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right flex items-center justify-end gap-2 text-yellow-400 font-bold">
                                            {ev.score} XP <Trophy size={16} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
