
import { useEffect, useRef } from 'react';
import { useSharedData } from '@/data/sharedDataStore';
import { useNotifications } from '@/hooks/useNotifications';

export function useContentNotifications(studentId: string, enrolledSubjects: string[]) {
  const { addNotification } = useNotifications();
  const { modules, lessons, assignments, quizzes, liveClasses, rewards, messages } = useSharedData();
  
  const prevModulesRef = useRef(modules.length);
  const prevLessonsRef = useRef(lessons.length);
  const prevAssignmentsRef = useRef(assignments.length);
  const prevQuizzesRef = useRef(quizzes.length);
  const prevLiveClassesRef = useRef(liveClasses.length);
  const prevRewardsRef = useRef(rewards.filter(r => r.studentId === studentId).length);
  const prevMessagesRef = useRef(messages.filter(m => m.to === studentId || m.to === 'all').length);

  
  useEffect(() => {
    if (modules.length > prevModulesRef.current) {
      const newModules = modules.filter(m => 
        m.isNew && enrolledSubjects.includes(m.subjectId)
      );
      newModules.forEach(module => {
        addNotification({
          type: 'class',
          title: 'New Module Added!',
          description: `${module.title} has been added to your course`,
          actionUrl: '/student/subjects'
        });
      });
    }
    prevModulesRef.current = modules.length;
  }, [modules, enrolledSubjects, addNotification]);

  
  useEffect(() => {
    if (lessons.length > prevLessonsRef.current) {
      const newLessons = lessons.filter(l => 
        l.isNew && enrolledSubjects.includes(l.subjectId)
      );
      newLessons.forEach(lesson => {
        addNotification({
          type: 'class',
          title: 'New Lesson Available!',
          description: `${lesson.title} - ${lesson.type} content ready`,
          actionUrl: '/student/subjects'
        });
      });
    }
    prevLessonsRef.current = lessons.length;
  }, [lessons, enrolledSubjects, addNotification]);

  
  useEffect(() => {
    if (assignments.length > prevAssignmentsRef.current) {
      const newAssignments = assignments.filter(a => 
        a.isNew && a.status === 'active' && enrolledSubjects.includes(a.subjectId)
      );
      newAssignments.forEach(assignment => {
        addNotification({
          type: 'reminder',
          title: 'New Assignment!',
          description: `${assignment.title} - Due: ${new Date(assignment.dueDate).toLocaleDateString()}`,
          actionUrl: '/student/assignments'
        });
      });
    }
    prevAssignmentsRef.current = assignments.length;
  }, [assignments, enrolledSubjects, addNotification]);

  
  useEffect(() => {
    if (quizzes.length > prevQuizzesRef.current) {
      const newQuizzes = quizzes.filter(q => 
        q.isNew && q.status === 'active' && enrolledSubjects.includes(q.subjectId)
      );
      newQuizzes.forEach(quiz => {
        addNotification({
          type: 'quiz',
          title: 'New Quiz Available!',
          description: `${quiz.title} - ${quiz.questions.length} questions`,
          actionUrl: '/student/quizzes'
        });
      });
    }
    prevQuizzesRef.current = quizzes.length;
  }, [quizzes, enrolledSubjects, addNotification]);

  
  useEffect(() => {
    if (liveClasses.length > prevLiveClassesRef.current) {
      const newClasses = liveClasses.filter(c => 
        c.isNew && enrolledSubjects.includes(c.subjectId)
      );
      newClasses.forEach(liveClass => {
        addNotification({
          type: 'class',
          title: 'Live Class Scheduled!',
          description: `${liveClass.title} - ${new Date(liveClass.scheduledAt).toLocaleString()}`,
          actionUrl: '/student/schedule'
        });
      });
    }
    prevLiveClassesRef.current = liveClasses.length;
  }, [liveClasses, enrolledSubjects, addNotification]);

  
  useEffect(() => {
    const studentRewards = rewards.filter(r => r.studentId === studentId);
    if (studentRewards.length > prevRewardsRef.current) {
      const newRewards = studentRewards.slice(prevRewardsRef.current);
      newRewards.forEach(reward => {
        addNotification({
          type: 'achievement',
          title: `${reward.type === 'badge' ? '🏆 Badge' : reward.type === 'trophy' ? '🏅 Trophy' : '⭐ Reward'} Earned!`,
          description: `${reward.name} - ${reward.reason}`,
          actionUrl: '/student/achievements'
        });
      });
    }
    prevRewardsRef.current = studentRewards.length;
  }, [rewards, studentId, addNotification]);

  
  useEffect(() => {
    const studentMessages = messages.filter(m => m.to === studentId || m.to === 'all');
    if (studentMessages.length > prevMessagesRef.current) {
      const newMessages = studentMessages.filter(m => !m.read);
      newMessages.forEach(message => {
        if (message.type === 'announcement') {
          addNotification({
            type: 'message',
            title: '📢 New Announcement',
            description: `${message.fromName}: ${message.subject}`,
            actionUrl: '/student/messages'
          });
        } else {
          addNotification({
            type: 'message',
            title: 'New Message',
            description: `From ${message.fromName}: ${message.subject}`,
            actionUrl: '/student/messages'
          });
        }
      });
    }
    prevMessagesRef.current = studentMessages.length;
  }, [messages, studentId, addNotification]);
}
