import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Heart, Camera, Mic, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useBrainBucksStore } from '../../store/brainBucksStore';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface MemoryEntry {
  id: string;
  title: string;
  content: string | null;
  entry_date: string;
  tags: string[];
  emotional_tone: string | null;
  memory_type: string;
  created_at: string;
}

export const MemoryMap: React.FC = () => {
  const { profile, preferences } = useAuthStore();
  const { addBrainBucks } = useBrainBucksStore();
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    emotional_tone: '',
    memory_type: 'moment',
    tags: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const animationsEnabled = preferences?.animations_enabled ?? true;
  const MotionDiv = animationsEnabled ? motion.div : 'div';

  const memoryTypes = [
    { value: 'moment', label: 'Memory Moment', icon: Heart },
    { value: 'meal', label: 'Memory Meal', icon: Camera },
    { value: 'anchor', label: 'Memory Anchor', icon: MapPin },
  ];

  const emotionalTones = ['Joyful', 'Peaceful', 'Grateful', 'Proud', 'Loved', 'Safe', 'Content'];

  useEffect(() => {
    if (profile) {
      loadMemories();
    }
  }, [profile]);

  const loadMemories = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('memory_entries')
      .select('*')
      .eq('user_id', profile.id)
      .order('entry_date', { ascending: false });

    if (error) {
      toast.error('Error loading memories');
    } else {
      setMemories(data || []);
    }
    setIsLoading(false);
  };

  const addMemory = async () => {
    if (!profile || !newMemory.title.trim()) return;

    const { error } = await supabase
      .from('memory_entries')
      .insert([{
        user_id: profile.id,
        title: newMemory.title.trim(),
        content: newMemory.content.trim() || null,
        entry_date: newMemory.entry_date,
        emotional_tone: newMemory.emotional_tone || null,
        memory_type: newMemory.memory_type,
        tags: newMemory.tags,
      }]);

    if (error) {
      toast.error('Error adding memory');
    } else {
      await addBrainBucks(5, 'memory_added', 'Memory added to your map');
      setNewMemory({
        title: '',
        content: '',
        entry_date: format(new Date(), 'yyyy-MM-dd'),
        emotional_tone: '',
        memory_type: 'moment',
        tags: [],
      });
      setShowAddMemory(false);
      loadMemories();
    }
  };

  const addTag = (tag: string) => {
    if (!newMemory.tags.includes(tag)) {
      setNewMemory(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setNewMemory(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

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
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Memory Map
          </h1>
        </div>
        <p className="text-gray-600">
          Your collection of moments that matter
        </p>
      </MotionDiv>

      {/* Add Memory Button */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.5, delay: 0.2 }
        })}
        className="text-center"
      >
        <button
          onClick={() => setShowAddMemory(!showAddMemory)}
          className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all inline-flex items-center space-x-3"
        >
          <Plus className="w-5 h-5" />
          <span>Add to Memory Map</span>
        </button>
      </MotionDiv>

      {/* Add Memory Form */}
      <AnimatePresence>
        {showAddMemory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Capture a Memory</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memory Title
                </label>
                <input
                  type="text"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="What happened?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details (optional)
                </label>
                <textarea
                  value={newMemory.content}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent h-24 resize-none"
                  placeholder="Tell the story..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={newMemory.entry_date}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, entry_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memory Type
                  </label>
                  <select
                    value={newMemory.memory_type}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, memory_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {memoryTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How did this feel?
                </label>
                <div className="flex flex-wrap gap-2">
                  {emotionalTones.map(tone => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setNewMemory(prev => ({ 
                        ...prev, 
                        emotional_tone: prev.emotional_tone === tone ? '' : tone 
                      }))}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        newMemory.emotional_tone === tone
                          ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-pink-200'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={addMemory}
                  className="bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                >
                  Save Memory
                </button>
                <button
                  onClick={() => setShowAddMemory(false)}
                  className="text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Timeline */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          </div>
        ) : memories.length === 0 ? (
          <MotionDiv
            {...(animationsEnabled && {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 0.5 }
            })}
            className="text-center py-12"
          >
            <MapPin className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Memory Map Awaits</h3>
            <p className="text-gray-600">Start capturing the moments that anchor you.</p>
          </MotionDiv>
        ) : (
          memories.map((memory, index) => (
            <MotionDiv
              key={memory.id}
              {...(animationsEnabled && {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5, delay: index * 0.1 }
              })}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{memory.title}</h3>
                    <span className="text-sm text-gray-500">
                      {format(parseISO(memory.entry_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  {memory.content && (
                    <p className="text-gray-600 mb-3">{memory.content}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
                      {memoryTypes.find(t => t.value === memory.memory_type)?.label || memory.memory_type}
                    </span>
                    
                    {memory.emotional_tone && (
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                        {memory.emotional_tone}
                      </span>
                    )}
                    
                    {memory.tags.map(tag => (
                      <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </MotionDiv>
          ))
        )}
      </div>

      {/* Affirming message */}
      <MotionDiv
        {...(animationsEnabled && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, delay: 0.7 }
        })}
        className="text-center"
      >
        <p className="text-gray-500 italic">
          "These moments are your anchors. They remind you who you are."
        </p>
      </MotionDiv>
    </div>
  );
};