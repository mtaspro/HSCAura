import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaWhatsapp, FaPaperPlane, FaUsers, FaUser, FaCalendar } from 'react-icons/fa';
import { secureStorage } from '../utils/secureStorage.js';

const AdminWhatsApp = () => {
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [groupId, setGroupId] = useState('');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [battleGroupId, setBattleGroupId] = useState('');
  const [calendarGroups, setCalendarGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchGroups();
    fetchBattleGroup();
    fetchCalendarGroups();
    fetchExams();
  }, []);

  const fetchUsers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = secureStorage.getToken();
      const response = await axios.get(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = response.data.users || response.data || [];
      setUsers(usersData.filter(user => user && user.phoneNumber));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const fetchGroups = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = secureStorage.getToken();
      const response = await axios.get(`${apiUrl}/api/whatsapp/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.groups) {
        setGroups(response.data.groups);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setGroups([]);
    }
  };

  const fetchBattleGroup = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = secureStorage.getToken();
      const response = await axios.get(`${apiUrl}/api/whatsapp/battle-group`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBattleGroupId(response.data.groupId || '');
    } catch (error) {
      console.error('Failed to fetch battle group:', error);
    }
  };

  const fetchCalendarGroups = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = secureStorage.getToken();
      const response = await axios.get(`${apiUrl}/api/whatsapp/calendar-group`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCalendarGroups(response.data.groups || []);
    } catch (error) {
      console.error('Failed to fetch calendar groups:', error);
      setCalendarGroups([]);
    }
  };

  const fetchExams = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/api/exams`);
      setExams(response.data || []);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      setExams([]);
    }
  };

  const getGroupExams = (groupId) => {
    const group = calendarGroups.find(g => g.groupId === groupId);
    return group ? group.examIds || [] : [];
  };

  const toggleGroupSelection = (groupId) => {
    setCalendarGroups(prev => {
      const exists = prev.find(g => g.groupId === groupId);
      if (exists) {
        return prev.filter(g => g.groupId !== groupId);
      }
      return [...prev, { groupId, groupName: '', examIds: [] }];
    });
  };

  const toggleExamForGroup = (groupId, examId) => {
    setCalendarGroups(prev => prev.map(g => {
      if (g.groupId !== groupId) return g;
      const examIds = g.examIds || [];
      if (examIds.includes(examId)) {
        return { ...g, examIds: examIds.filter(id => id !== examId) };
      }
      return { ...g, examIds: [...examIds, examId] };
    }));
  };

  const setBattleGroup = async () => {
    if (!battleGroupId.trim()) {
      setErrorMessage('Please select a group for battle notifications');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = secureStorage.getToken();
      const response = await axios.post(`${apiUrl}/api/whatsapp/set-battle-group`,
        { groupId: battleGroupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMessage('Battle notification group set successfully!');
      } else {
        setErrorMessage(response.data.error || 'Failed to set battle group');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to set battle group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCalendarGroups = async () => {
    if (calendarGroups.length === 0) {
      setErrorMessage('Please select at least one group for daily calendar updates');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = secureStorage.getToken();
      const response = await axios.post(`${apiUrl}/api/whatsapp/set-calendar-group`,
        { groups: calendarGroups },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMessage('Daily calendar groups set successfully!');
      } else {
        setErrorMessage(response.data.error || 'Failed to set calendar groups');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to set calendar groups');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerCalendarUpdate = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await axios.post(`${apiUrl}/api/calendar/trigger`);
      setSuccessMessage('Daily calendar update sent successfully!');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to trigger calendar update');
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const sendMessage = async (type) => {
    if (!message.trim()) {
      setErrorMessage('Message is required');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const token = secureStorage.getToken();

      let endpoint = '';
      let data = { message };

      switch (type) {
        case 'individual':
          if (!phoneNumber.trim()) {
            setErrorMessage('Phone number is required');
            setIsLoading(false);
            return;
          }
          endpoint = '/api/whatsapp/send-message';
          data.phoneNumber = phoneNumber;
          break;
        case 'broadcast':
          endpoint = '/api/whatsapp/broadcast';
          data.userIds = selectedUsers;
          break;
        case 'group':
          if (!groupId.trim()) {
            setErrorMessage('Group ID is required');
            setIsLoading(false);
            return;
          }
          endpoint = '/api/whatsapp/send-group';
          data.groupId = groupId;
          break;
      }

      const response = await axios.post(`${apiUrl}${endpoint}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success || response.data.results) {
        setSuccessMessage(response.data.message || 'Message sent successfully!');
        setMessage('');
        setPhoneNumber('');
        setGroupId('');
        setSelectedUsers([]);
      } else {
        setErrorMessage(response.data.error || 'Failed to send message');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FaWhatsapp className="mr-3" />
            WhatsApp Admin Panel
          </h1>
          <p className="text-green-200 mt-2">Send messages to users via WhatsApp</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md mb-6"
          >
            {successMessage}
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6"
          >
            {errorMessage}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Composition */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">Compose Message</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
              />
            </div>

            {/* Individual Message */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <FaUser className="mr-2" />
                Send to Individual
              </h3>
              <div className="flex gap-2">
                <select
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user._id} value={user.phoneNumber}>
                      {user.username} ({user.phoneNumber})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => sendMessage('individual')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  <FaPaperPlane className="mr-1" />
                  Send
                </button>
              </div>
            </div>

            {/* Group Message */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Send to Group</h3>
              <div className="flex gap-2">
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                >
                  <option value="">Select Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.participants} members)
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => sendMessage('group')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  <FaPaperPlane className="mr-1" />
                  Send
                </button>
              </div>
              {groups.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  No groups found. Make sure WhatsApp is connected and you're in some groups.
                </p>
              )}
            </div>

            {/* Battle Notifications */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Battle Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Set which group receives battle notifications (create, start, end)
              </p>
              <div className="flex gap-2">
                <select
                  value={battleGroupId}
                  onChange={(e) => setBattleGroupId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700"
                >
                  <option value="">Select Group for Battle Notifications</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.participants} members)
                    </option>
                  ))}
                </select>
                <button
                  onClick={setBattleGroup}
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>

            {/* Daily Calendar Updates */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FaCalendar className="text-blue-600" />
                <h3 className="font-semibold mb-0">📅 Daily Calendar Updates</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select multiple groups to receive daily calendar updates at 12:00 AM Bangladesh time.
                For each group, choose which exams (from Exam Manager) should be included in that group's AI-generated message.
              </p>

              {/* Group selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Groups</label>
                <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  {groups.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-3">No groups available</p>
                  ) : (
                    groups.map(group => {
                      const isSelected = calendarGroups.some(g => g.groupId === group.id);
                      return (
                        <div
                          key={group.id}
                          className={`flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200' : 'border-b border-gray-100 dark:border-gray-700'}`}
                          onClick={() => toggleGroupSelection(group.id)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleGroupSelection(group.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm">{group.name}</span>
                            <span className="text-xs text-gray-500">({group.participants} members)</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Per-group exam selection */}
              {calendarGroups.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Select Exams Per Group</p>
                  {calendarGroups.map((group, idx) => {
                    const groupInfo = groups.find(g => g.id === group.groupId);
                    const groupExams = getGroupExams(group.groupId);
                    return (
                      <div key={idx} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{groupInfo ? groupInfo.name : group.groupId}</span>
                          <span className="text-xs text-gray-500">{groupExams.length} exam(s) selected</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {exams.map(exam => {
                            const isSelected = groupExams.includes(exam._id);
                            const examDate = new Date(exam.examDate);
                            return (
                              <label key={exam._id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleExamForGroup(group.groupId, exam._id)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-xs leading-tight">
                                  {exam.examName}
                                  <br />
                                  <span className="text-[10px] text-gray-500">{examDate.toLocaleDateString()}</span>
                                </span>
                              </label>
                            );
                          })}
                          {exams.length === 0 && (
                            <p className="col-span-full text-xs text-gray-500 text-center">No exams available. Add exams in Exam Manager.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleSaveCalendarGroups}
                disabled={isLoading || calendarGroups.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                💾 Save Calendar Groups & Exams
              </button>

              <button
                onClick={triggerCalendarUpdate}
                disabled={isLoading}
                className="w-full px-4 py-2 mt-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                📅 Send Today's Calendar Update (Test)
              </button>
            </div>

            {/* Broadcast */}
            <div>
              <button
                onClick={() => sendMessage('broadcast')}
                disabled={isLoading || selectedUsers.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                <FaUsers className="mr-2" />
                Broadcast to Selected Users ({selectedUsers.length})
              </button>
            </div>
          </motion.div>

          {/* User Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4">Select Users</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Users with phone numbers ({users.length} total)
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map(user => (
                <div
                  key={user._id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUsers.includes(user._id)
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.phoneNumber}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No users with phone numbers found
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminWhatsApp;
