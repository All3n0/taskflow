import { motion } from 'framer-motion';
import { Trash2, Download, Upload, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Task } from './../../types/task';
import { toast } from 'sonner';

interface SettingsViewProps {
  tasks: Task[];
  onClearAllTasks: () => void;
}

export function SettingsView({ tasks, onClearAllTasks }: SettingsViewProps) {
  const handleExport = () => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kazora-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Tasks exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (Array.isArray(imported)) {
          localStorage.setItem('kazora-tasks', JSON.stringify(imported));
          window.location.reload();
        }
      } catch {
        toast.error('Invalid file format');
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
      localStorage.removeItem('kazora-tasks');
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-2xl mx-auto space-y-6"
    >
      {/* Data Management */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-6">Data Management</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div>
              <p className="font-medium">Export Tasks</p>
              <p className="text-sm text-muted-foreground">
                Download all your tasks as a JSON file
              </p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div>
              <p className="font-medium">Import Tasks</p>
              <p className="text-sm text-muted-foreground">
                Load tasks from a backup file
              </p>
            </div>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10">
            <div>
              <p className="font-medium text-destructive">Clear All Data</p>
              <p className="text-sm text-destructive/80">
                Permanently delete all tasks
              </p>
            </div>
            <Button variant="destructive" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Storage</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Your data is stored locally in your browser
            </p>
            <p className="text-2xl font-semibold mt-2">
              {tasks.length} tasks
            </p>
          </div>
          <RefreshCw className="w-8 h-8 text-muted-foreground/50" />
        </div>
      </div>

      {/* About */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">About kazora</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          kazora is a modern, privacy-focused task management app. All your data stays
          on your device – we don't collect or store any personal information.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Version 1.0.0
        </p>
      </div>
    </motion.div>
  );
}
