import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2, Wrench, Loader2, Shield, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface AITroubleshootModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  accessToken?: string;
  workspaceId?: string;
}

interface IssueDiagnosis {
  issueType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requiresAdmin: boolean;
  autoFixable: boolean;
  recommendedActions: string[];
}

interface FixResult {
  success: boolean;
  message: string;
  details?: any;
  requiresAdminApproval?: boolean;
}

export function AITroubleshootModal({ 
  isOpen, 
  onClose, 
  initialQuery = '', 
  accessToken,
  workspaceId 
}: AITroubleshootModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<IssueDiagnosis | null>(null);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [userRole, setUserRole] = useState<string>('developer');
  const [isAdmin, setIsAdmin] = useState(false);
  const [canFix, setCanFix] = useState(false);

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast.error('Please describe the issue you\'re experiencing');
      return;
    }

    setIsAnalyzing(true);
    setDiagnosis(null);
    setFixResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || publicAnonKey}`
          },
          body: JSON.stringify({ 
            query,
            workspaceId,
            context: { source: 'troubleshoot_modal' }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Troubleshooting failed: ${response.status}`);
      }

      const data = await response.json();
      
      setDiagnosis(data.diagnosis);
      setFixResult(data.fixResult);
      setUserRole(data.userRole || 'developer');
      setIsAdmin(data.isAdmin || false);
      setCanFix(data.canFix || false);

      // Show toast based on result
      if (data.diagnosis?.requiresAdmin && !data.isAdmin) {
        toast.warning('Admin access required to fix this issue', {
          description: 'Contact your workspace administrator for help.'
        });
      } else if (data.fixResult?.success) {
        toast.success('Issue resolved!', {
          description: data.fixResult.message
        });
      }

    } catch (error) {
      console.error('Troubleshooting error:', error);
      toast.error('Failed to analyze issue. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmFix = async () => {
    if (!diagnosis) return;

    setIsFixing(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot/confirm-fix`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || publicAnonKey}`
          },
          body: JSON.stringify({ 
            diagnosis,
            workspaceId
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Fix failed: ${response.status}`);
      }

      const data = await response.json();
      setFixResult(data.fixResult);

      if (data.fixResult?.success) {
        toast.success('✅ Issue fixed!', {
          description: data.fixResult.message
        });
      } else {
        toast.error('Fix failed', {
          description: data.fixResult?.message || 'Could not fix the issue'
        });
      }

    } catch (error) {
      console.error('Fix error:', error);
      toast.error('Failed to apply fix. Please try again.');
    } finally {
      setIsFixing(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertCircle;
      case 'high': return AlertTriangle;
      case 'medium': return Info;
      case 'low': return CheckCircle2;
      default: return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#FCA311';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-3xl shadow-2xl border border-red-200/30 w-full max-w-3xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200/30 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>
                    AI Troubleshooting
                  </h2>
                  <p className="text-sm text-gray-600">Automatically diagnose and fix issues</p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-8 h-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* User Role Badge */}
            <div className="mb-4 flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  backgroundColor: isAdmin ? 'rgba(220, 38, 38, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: isAdmin ? '#DC2626' : '#3B82F6',
                  borderColor: isAdmin ? '#DC2626' : '#3B82F6'
                }}
              >
                {isAdmin && <Shield className="w-3 h-3 mr-1" />}
                {userRole}
              </Badge>
              {isAdmin && (
                <span className="text-xs text-gray-600">You have admin privileges</span>
              )}
            </div>

            {/* Query Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                Describe your issue
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe the issue you're experiencing..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !query.trim()}
                className="mt-3 w-full text-white shadow-md"
                style={{ background: 'linear-gradient(to right, #DC2626, #EA580C)' }}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" style={{ color: '#FCA311' }} />
                    Diagnose Issue
                  </>
                )}
              </Button>
            </div>

            {/* Diagnosis Results */}
            {diagnosis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Issue Type Card */}
                <Card className="border-2" style={{ borderColor: getSeverityColor(diagnosis.severity) }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {(() => {
                        const Icon = getSeverityIcon(diagnosis.severity);
                        return <Icon className="w-6 h-6 mt-1" style={{ color: getSeverityColor(diagnosis.severity) }} />;
                      })()}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg" style={{ color: '#000000' }}>
                            {diagnosis.issueType.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <Badge 
                            style={{ 
                              backgroundColor: `${getSeverityColor(diagnosis.severity)}20`,
                              color: getSeverityColor(diagnosis.severity)
                            }}
                          >
                            {diagnosis.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          {diagnosis.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {diagnosis.autoFixable && (
                            <Badge variant="outline" className="text-xs" style={{ borderColor: '#10B981', color: '#10B981' }}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Auto-fixable
                            </Badge>
                          )}
                          {diagnosis.requiresAdmin && (
                            <Badge variant="outline" className="text-xs" style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                              <Shield className="w-3 h-3 mr-1" />
                              Requires Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Actions */}
                {diagnosis.recommendedActions && diagnosis.recommendedActions.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3" style={{ color: '#000000' }}>
                        Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {diagnosis.recommendedActions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(252, 163, 17, 0.2)', color: '#FCA311' }}>
                              {idx + 1}
                            </span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Fix Result */}
                {fixResult && (
                  <Card className={`border-2 ${fixResult.success ? 'border-green-500' : 'border-yellow-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {fixResult.success ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2" style={{ color: '#000000' }}>
                            {fixResult.success ? 'Fix Applied' : 'Action Required'}
                          </h4>
                          <p className="text-sm text-gray-700">
                            {fixResult.message}
                          </p>
                          {fixResult.details && (
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(fixResult.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Admin Confirmation */}
                {diagnosis.requiresAdmin && isAdmin && diagnosis.autoFixable && !fixResult?.success && (
                  <Card className="border-2 border-red-500 bg-red-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-red-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2 text-red-900">
                            Admin Confirmation Required
                          </h4>
                          <p className="text-sm text-red-700 mb-3">
                            This fix will make system-wide changes. As an admin, you can approve and execute this fix.
                          </p>
                          <Button
                            onClick={handleConfirmFix}
                            disabled={isFixing}
                            className="text-white"
                            style={{ backgroundColor: '#DC2626' }}
                          >
                            {isFixing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Applying Fix...
                              </>
                            ) : (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                Confirm & Fix
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Permission Denied */}
                {diagnosis.requiresAdmin && !isAdmin && (
                  <Card className="border-2 border-yellow-500 bg-yellow-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2 text-yellow-900">
                            Admin Access Required
                          </h4>
                          <p className="text-sm text-yellow-700">
                            You don't have admin privileges to fix this issue. Please contact your workspace administrator or project manager for assistance.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200/30 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                💡 <span className="font-medium">Tip:</span> Be specific about the issue for better diagnosis
              </p>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 hover:bg-gray-100"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
