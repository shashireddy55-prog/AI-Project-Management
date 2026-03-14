import { AlertCircle, ExternalLink, CreditCard, Key, HelpCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function OpenAIQuotaHelp() {
  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold" style={{ color: '#14213D' }}>
              OpenAI API Quota Exceeded
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Don't worry! Your app is still fully functional in demo mode.
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* What's Happening */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5" style={{ color: '#FCA311' }} />
            <h3 className="font-semibold" style={{ color: '#14213D' }}>
              What's Happening?
            </h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Your OpenAI API key has reached its usage limit. All AI-powered features (ZCPC workspace 
            creation, AI commands, story generation, sprint planning) are now using demo mode with 
            sample data. The rest of your application works perfectly!
          </p>
        </div>

        {/* How to Fix */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5" style={{ color: '#FCA311' }} />
            <h3 className="font-semibold" style={{ color: '#14213D' }}>
              How to Fix This
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: '#14213D' }}>
                1
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#14213D' }}>
                  Add Billing to Your OpenAI Account
                </p>
                <p className="text-xs text-gray-600 mt-1 mb-2">
                  Visit your OpenAI billing page and add payment information to increase your quota.
                </p>
                <a
                  href="https://platform.openai.com/account/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="sm" 
                    className="text-white"
                    style={{ backgroundColor: '#14213D' }}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Open Billing Dashboard
                  </Button>
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: '#14213D' }}>
                2
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#14213D' }}>
                  Check Your Usage Limits
                </p>
                <p className="text-xs text-gray-600 mt-1 mb-2">
                  Review your current usage and limits to ensure you have enough quota.
                </p>
                <a
                  href="https://platform.openai.com/account/usage"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="sm" 
                    variant="outline"
                    style={{ borderColor: '#14213D', color: '#14213D' }}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View Usage
                  </Button>
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: '#14213D' }}>
                3
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#14213D' }}>
                  Get a New API Key (Optional)
                </p>
                <p className="text-xs text-gray-600 mt-1 mb-2">
                  If needed, you can generate a new API key and update it in Admin Settings.
                </p>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="sm" 
                    variant="outline"
                    style={{ borderColor: '#14213D', color: '#14213D' }}
                  >
                    <Key className="w-3 h-3 mr-2" />
                    Manage API Keys
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* What Works in Demo Mode */}
        <div className="border-t border-amber-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5" style={{ color: '#FCA311' }} />
            <h3 className="font-semibold" style={{ color: '#14213D' }}>
              What Works in Demo Mode?
            </h3>
          </div>
          <ul className="space-y-2">
            {[
              'All workspace management features',
              'Manual project, epic, and story creation',
              'Kanban board with drag & drop',
              'Sprint management',
              'Team collaboration features',
              'Settings and configuration',
              'Data persistence'
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FCA311' }}></div>
                {feature}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-600 mt-3 italic">
            Only AI-powered content generation is temporarily unavailable.
          </p>
        </div>

        {/* Support Link */}
        <div className="border-t border-amber-200 pt-4">
          <p className="text-xs text-gray-600">
            Need help? Visit the{' '}
            <a
              href="https://platform.openai.com/docs/guides/error-codes"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:text-gray-800"
              style={{ color: '#14213D' }}
            >
              OpenAI Error Codes Documentation
              <ExternalLink className="w-3 h-3 inline ml-1" />
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
