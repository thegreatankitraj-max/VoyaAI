import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, CheckCircle2, Circle, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser]);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await base44.entities.Task.filter(
        { created_by_id: currentUser.id },
        "-created_date"
      );
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    await base44.entities.Task.create(newTask);
    setNewTask({ title: "", description: "", priority: "medium", due_date: "" });
    setIsAddingTask(false);
    loadTasks();
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await base44.entities.Task.update(task.id, { status: newStatus });
    loadTasks();
  };

  const deleteTask = async (taskId) => {
    await base44.entities.Task.delete(taskId);
    loadTasks();
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  const groupedTasks = {
    pending: tasks.filter(t => t.status === "pending"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    completed: tasks.filter(t => t.status === "completed")
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your AI-assisted to-do list
            </p>
          </div>
          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-purple-500 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Create New Task</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Add a new task to your list
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Textarea
                  placeholder="Description (optional)..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <div className="flex gap-4">
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <Button onClick={handleAddTask} className="w-full bg-gradient-to-br from-purple-500 to-blue-600">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <div key={status}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize">
                {status.replace('_', ' ')} ({statusTasks.length})
              </h3>
              <AnimatePresence>
                {statusTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="mb-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <button
                            onClick={() => toggleTaskStatus(task)}
                            className="mt-1"
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <h4 className={`font-semibold text-gray-900 dark:text-gray-100 mb-2 ${
                          task.status === 'completed' ? 'line-through opacity-60' : ''
                        }`}>
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={priorityColors[task.priority]}>
                            {task.priority}
                          </Badge>
                          {task.created_by_ai && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              AI Created
                            </Badge>
                          )}
                          {task.due_date && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(task.due_date), 'MMM d')}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}