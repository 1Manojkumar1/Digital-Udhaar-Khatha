import React, { useEffect, useState, useRef } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const REFRESH_INTERVAL = 60000;

const EmailStatus = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await axiosInstance.get('/api/reminders/stats');
      if (res.data.success) setData(res.data.data);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] text-slate-400 whitespace-nowrap">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
      <Mail className="w-3 h-3 text-blue-600" />
      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Email</span>
      <span className="text-[10px] text-slate-400">|</span>
      <div className="flex items-center space-x-1">
        <span className="text-[10px] font-semibold text-slate-500">
          Today: <span className="text-slate-700">{data.todayMessages}</span>
        </span>
      </div>
      <span className="text-[10px] font-semibold text-slate-400">
        / {data.monthlyMessages} this month
      </span>
    </div>
  );
};

export default EmailStatus;
