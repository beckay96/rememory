import React, { useState, useEffect } from 'react';
import { Compass, Plus, CheckCircle, Clock, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useBrainBucksStore } from '../../store/brainBucksStore';
import { supabase } from '../../lib/supabase';
import { format, isToday } from 'date-fns';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority_level: number;
  is_completed: boolean;
  due_date: string | null;
}

export const CriticalCompass: React.FC = () => {
  const { profile, preferences } = useAuthStore();
  const { addBrainBucks } = useBrainBucksStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const animationsEnabled = preferences?.animations_enabled ?? true;
  const MotionDiv = animationsEnabled ? motion.div : 'div';

  useEffect(() => {
    if (profile) {
      loadTasks();
    }
  }, [profile]);

  const loadTasks = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', profile.id)
      .order('priority_level', { ascending: false })
      .limit(3);

    if (error) {
      toast.error('Error loading tasks');
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  };

  const addTask = async () => {
    if (!profile || !newTask.trim()) return;

    const { error } = await supabase
      .from('tasks')
      .insert([{
        user_id: profile.id,
        title: newTask.trim(),
        priority_level: 1,
      }]);

    if (error) {
      toast.error('Error adding task');
    } else {
      setNewTask('');
      setShowAddTask(false);
      loadTasks();
      toast.success('Task added!');
    }
  };

  const completeTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      toast.error('Error completing task');
    } else {
      await addBrainBucks(5, 'task_completed', 'Task completed');
      loadTasks();
    }
  };

  const todaysTasks = tasks.filter(task => 
    !task.is_completed && (
      !task.due_date || isToday(new Date(task.due_date))
    )
  );

  const nextCriticalTask = todaysTasks[0];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 }
        })}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Critical Compass
          </h1>
        </div>
        <p className="text-gray-600">
          Your gentle guide for what matters today
        </p>
      </MotionDiv>

      {/* Next Critical Thing */}
      {nextCriticalTask && (
        <MotionDiv
          {...(animationsEnabled && {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.5, delay: 0.2 }
          })}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-emerald-800">Next Critical Thing</h2>
          </div>
          <div className="bg-white/60 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {nextCriticalTask.title}
            </h3>
            {nextCriticalTask.description && (
              <p className="text-gray-600 mb-4">{nextCriticalTask.description}</p>
            )}
            <button
              onClick={() => completeTask(nextCriticalTask.id)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Mark Complete</span>
            </button>
          </div>
        </MotionDiv>
      )}

      {/* Today's Priorities */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.3 }
        })}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Today's Priorities</span>
          </h2>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-blue-50 rounded-xl p-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What needs your attention today?"
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={addTask}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Task
                  </button>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : todaysTasks.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-gray-600">
                All clear for today! You're doing great.
              </p>
            </div>
          ) : (
            todaysTasks.map((task, index) => (
              <MotionDiv
                key={task.id}
                {...(animationsEnabled && {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.3, delay: index * 0.1 }
                })}
                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-blue-600 mt-1">
                        Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => completeTask(task.id)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </MotionDiv>
            ))
          )}
        </div>
      </MotionDiv>

      {/* Affirming message */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, delay: 0.5 }
        })}
        className="text-center"
      >
        <p className="text-gray-500 italic">
          "You remembered what mattered. That was a win."
        </p>
      </MotionDiv>
    </div>
  );
};