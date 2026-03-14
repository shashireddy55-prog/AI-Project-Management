import { useState } from 'react';
import { Eye, EyeOff, Sparkles, Zap, Mail, Lock, ArrowRight, Brain, CheckCircle, Building2, User, Globe, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Logo } from './Logo';
import { getSupabaseClient } from '/utils/supabase/client';
import { motion } from 'motion/react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

const supabase = getSupabaseClient();

// Key ZCPC highlights
const keyHighlights = [
  'Industry Detection',
  'Methodology Selection', 
  'Workflow Generation',
  'Issue Type Creation',
  'Role Assignment',
  'Backlog Generation',
  'Sprint Plan Creation',
  'Capacity Allocation',
  'Automation Setup',
  'Risk Engine Activation',
  'Report Generation',
  'Integration Setup',
  'Governance Snapshot',
  'Workspace Ready'
];

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Signup type selection
  const [signupType, setSignupType] = useState<'personal' | 'business' | null>(null);
  
  // Business signup fields
  const [organizationName, setOrganizationName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  // Subdomain validation
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainError, setSubdomainError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Welcome back! 🎉', {
          description: 'Logging you in...'
        });
        onLoginSuccess(data.session.access_token);
      }
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Invalid credentials'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔵 Starting signup process...');
      console.log('Email:', email);
      console.log('Name:', name);
      
      // Call server endpoint to create user with auto-confirmed email
      console.log('🔵 Calling server signup endpoint...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name })
        }
      );

      console.log('🔵 Server response status:', response.status);
      const result = await response.json();
      console.log('🔵 Server response:', result);

      if (!response.ok) {
        console.error('❌ Server returned error:', result.error);
        throw new Error(result.error || 'Signup failed');
      }

      console.log('✅ User created successfully, now signing in...');
      
      // Now sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      console.log('✅ Sign in successful!');

      if (data.session) {
        toast.success('Account created! 🎉', {
          description: 'Welcome to Projify AI'
        });
        onLoginSuccess(data.session.access_token);
      }
    } catch (error: any) {
      console.error('❌ Signup process failed:', error);
      toast.error('Signup failed', {
        description: error.message || 'Unable to create account'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔵 Starting business signup process...');
      console.log('Email:', email);
      console.log('Name:', name);
      console.log('Organization Name:', organizationName);
      console.log('Subdomain:', subdomain);
      console.log('Industry:', industry);
      console.log('Team Size:', teamSize);
      console.log('Job Title:', jobTitle);
      
      // Call server endpoint to create user with auto-confirmed email
      console.log('🔵 Calling server signup endpoint...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name, organizationName, subdomain, industry, teamSize, jobTitle })
        }
      );

      console.log('🔵 Server response status:', response.status);
      const result = await response.json();
      console.log('🔵 Server response:', result);

      if (!response.ok) {
        console.error('❌ Server returned error:', result.error);
        throw new Error(result.error || 'Signup failed');
      }

      console.log('✅ User created successfully, now signing in...');
      
      // Now sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      console.log('✅ Sign in successful!');

      if (data.session) {
        toast.success('Account created! 🎉', {
          description: 'Welcome to Projify AI'
        });
        onLoginSuccess(data.session.access_token);
      }
    } catch (error: any) {
      console.error('❌ Signup process failed:', error);
      toast.error('Signup failed', {
        description: error.message || 'Unable to create account'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubdomainAvailability = async () => {
    setIsCheckingSubdomain(true);
    setSubdomainAvailable(null);
    setSubdomainError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/subdomain/check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ subdomain })
        }
      );

      const result = await response.json();
      console.log('🔵 Subdomain check response:', result);

      if (!response.ok) {
        console.error('❌ Subdomain check error:', result.error);
        setSubdomainError(result.error || result.message || 'Failed to check subdomain availability');
        setSubdomainAvailable(false);
      } else {
        setSubdomainAvailable(result.available);
        if (!result.available) {
          setSubdomainError(result.message || 'Subdomain is not available');
        }
      }
    } catch (error: any) {
      console.error('❌ Subdomain check failed:', error);
      setSubdomainError('Failed to check subdomain availability');
      setSubdomainAvailable(null);
    } finally {
      setIsCheckingSubdomain(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #E5E5E5 100%)' }}>
      {/* Subtle animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: 'rgba(252, 163, 17, 0.2)' }}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0 
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* 3D Floating orbs - subtle light colors */}
      <motion.div 
        className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(252, 163, 17, 0.15)' }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-40 right-40 w-80 h-80 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(20, 33, 61, 0.1)' }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-[32rem] h-[32rem] rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(252, 163, 17, 0.12)' }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-8">
          {/* Header */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-6">
              <motion.div 
                className="rounded-3xl p-6 shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, #14213D 0%, #1a2d52 100%)',
                  borderColor: 'rgba(252, 163, 17, 0.3)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Logo size="xl" showText={false} animated={true} />
              </motion.div>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h1 className="text-7xl font-black mb-2">
                  <span style={{ color: '#000000' }}>
                    Projify
                  </span>
                  {' '}
                  <span className="text-gradient-orange">
                    AI
                  </span>
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FCA311' }} />
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#14213D', animationDelay: '0.3s' }} />
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FCA311', animationDelay: '0.6s' }} />
                  </div>
                  <p className="text-gray-800 text-xl font-bold tracking-wide">Zero-Config Project Creation</p>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                One Prompt. Complete Workspace.
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Transform a simple description into a fully configured project in seconds.
              </p>
            </motion.div>
          </motion.div>

          {/* ZCPC Flow Visualization - Clean White Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl" style={{ borderColor: 'rgba(252, 163, 17, 0.2)', borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: '#FCA311' }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <h3 className="text-lg font-bold text-gray-900">
                  ZERO-CONFIG PROJECT CREATION (ZCPC)
                </h3>
              </div>

              {/* User Prompt Entry */}
              <motion.div
                className="rounded-2xl p-6 mb-6"
                style={{ 
                  background: 'linear-gradient(to right, rgba(252, 163, 17, 0.08), rgba(252, 163, 17, 0.12))',
                  borderColor: '#FCA311',
                  borderWidth: '2px',
                  borderStyle: 'solid'
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-6 h-6" style={{ color: '#FCA311' }} />
                  <span className="font-bold text-gray-900">User Prompt</span>
                </div>
                <p className="text-sm text-gray-600 italic">
                  "Create a project for e-commerce platform development..."
                </p>
              </motion.div>

              {/* Flow Arrow */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 rotate-90" style={{ color: '#FCA311' }} />
                </motion.div>
              </div>

              {/* Key Steps Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {keyHighlights.slice(0, -1).map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.03 }}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all"
                    style={{ ':hover': { borderColor: '#FCA311' } }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.03, type: "spring" }}
                    >
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#FCA311' }} />
                    </motion.div>
                    <span className="text-sm font-medium text-gray-700">{step}</span>
                  </motion.div>
                ))}
              </div>

              {/* Flow Arrow */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                >
                  <ArrowRight className="w-6 h-6 rotate-90" style={{ color: '#FCA311' }} />
                </motion.div>
              </div>

              {/* Workspace Ready - Highlighted */}
              <motion.div
                className="rounded-2xl p-6 border-2"
                style={{ 
                  background: 'linear-gradient(to right, rgba(252, 163, 17, 0.08), rgba(252, 163, 17, 0.12))',
                  borderColor: '#FCA311'
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-7 h-7" style={{ color: '#FCA311' }} />
                  <span className="font-bold text-xl text-gray-900">Workspace Ready</span>
                  <Sparkles className="w-6 h-6 animate-pulse" style={{ color: '#FCA311' }} />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.6 }}
          >
            {[
              { value: '<30s', label: 'Setup Time' },
              { value: '100%', label: 'Automation' },
              { value: '14', label: 'Auto Steps' }
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="bg-white p-5 rounded-2xl text-center border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="text-3xl font-bold" style={{ color: '#FCA311' }}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600 mt-1.5 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right side - Login/Signup form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="bg-white/95 backdrop-blur-xl border-gray-200 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <div className="lg:hidden flex items-center gap-3 mb-4">
                <div className="bg-white rounded-xl p-2 shadow-md">
                  <Logo size="sm" showText={false} />
                </div>
                <CardTitle className="text-2xl" style={{ color: '#000000' }}>
                  Projify AI
                </CardTitle>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">Welcome</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access ZCPC capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 mb-6">
                  <TabsTrigger 
                    value="login"
                    style={{ 
                      '--tw-gradient-from': '#14213D',
                      '--tw-gradient-to': '#1a2d52'
                    } as any}
                    className="data-[state=active]:text-white"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    style={{ 
                      '--tw-gradient-from': '#14213D',
                      '--tw-gradient-to': '#1a2d52'
                    } as any}
                    className="data-[state=active]:text-white"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-700 font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-11 bg-white border-gray-300 h-12 text-gray-900"
                          style={{ 
                            '--focus-border-color': '#FCA311',
                          } as any}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700 font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-11 pr-11 bg-white border-gray-300 h-12 text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 cursor-pointer p-1"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      style={{ 
                        background: 'linear-gradient(to right, #14213D, #1a2d52)',
                      }}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Logging in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" style={{ color: '#FCA311' }} />
                          <span>Login</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-type" className="text-gray-700 font-medium">Choose Account Type</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSignupType('personal')}
                          className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                            signupType === 'personal' 
                              ? 'border-orange-500 bg-orange-50 shadow-lg' 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              signupType === 'personal' ? 'bg-orange-500' : 'bg-gray-200'
                            }`}>
                              <User className={`w-6 h-6 ${signupType === 'personal' ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <div className={`font-bold text-sm ${signupType === 'personal' ? 'text-orange-600' : 'text-gray-900'}`}>
                                Personal Use
                              </div>
                              <p className="text-xs text-gray-500 mt-1">For individual projects</p>
                            </div>
                          </div>
                          {signupType === 'personal' && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-5 h-5 text-orange-500" />
                            </div>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setSignupType('business')}
                          className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                            signupType === 'business' 
                              ? 'border-blue-500 bg-blue-50 shadow-lg' 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              signupType === 'business' ? 'bg-blue-500' : 'bg-gray-200'
                            }`}>
                              <Building2 className={`w-6 h-6 ${signupType === 'business' ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <div className={`font-bold text-sm ${signupType === 'business' ? 'text-blue-600' : 'text-gray-900'}`}>
                                Business Use
                              </div>
                              <p className="text-xs text-gray-500 mt-1">For organizations</p>
                            </div>
                          </div>
                          {signupType === 'business' && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {signupType === 'personal' && (
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="text-gray-700 font-medium">Full Name</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-white border-gray-300 h-12 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="pl-11 bg-white border-gray-300 h-12 text-gray-900"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-gray-700 font-medium">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="signup-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="pl-11 pr-11 bg-white border-gray-300 h-12 text-gray-900"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 cursor-pointer p-1"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                          style={{ 
                            background: 'linear-gradient(to right, #14213D, #1a2d52)',
                          }}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Creating account...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Zap className="w-5 h-5" style={{ color: '#FCA311' }} />
                              <span>Create Account</span>
                            </div>
                          )}
                        </Button>
                      </form>
                    )}
                    
                    {signupType === 'business' && (
                      <form onSubmit={handleBusinessSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="text-gray-700 font-medium">Full Name</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-white border-gray-300 h-12 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="pl-11 bg-white border-gray-300 h-12 text-gray-900"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-gray-700 font-medium">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="signup-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className="pl-11 pr-11 bg-white border-gray-300 h-12 text-gray-900"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 cursor-pointer p-1"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-organization-name" className="text-gray-700 font-medium">Organization Name</Label>
                          <Input
                            id="signup-organization-name"
                            type="text"
                            placeholder="Acme Corp"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            required
                            className="bg-white border-gray-300 h-12 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-subdomain" className="text-gray-700 font-medium">Subdomain</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="signup-subdomain"
                              type="text"
                              placeholder="acme"
                              value={subdomain}
                              onChange={(e) => setSubdomain(e.target.value)}
                              required
                              className="pl-11 bg-white border-gray-300 h-12 text-gray-900"
                              onBlur={checkSubdomainAvailability}
                            />
                            {isCheckingSubdomain && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                            {subdomainAvailable !== null && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {subdomainAvailable ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-red-500" />
                                )}
                              </div>
                            )}
                            {subdomainError && (
                              <p className="text-xs text-red-500 mt-1">{subdomainError}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-industry" className="text-gray-700 font-medium">Industry</Label>
                          <Input
                            id="signup-industry"
                            type="text"
                            placeholder="Technology"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            required
                            className="bg-white border-gray-300 h-12 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-team-size" className="text-gray-700 font-medium">Team Size</Label>
                          <Input
                            id="signup-team-size"
                            type="text"
                            placeholder="10"
                            value={teamSize}
                            onChange={(e) => setTeamSize(e.target.value)}
                            required
                            className="bg-white border-gray-300 h-12 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-job-title" className="text-gray-700 font-medium">Job Title</Label>
                          <Input
                            id="signup-job-title"
                            type="text"
                            placeholder="Project Manager"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            required
                            className="bg-white border-gray-300 h-12 text-gray-900"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={isLoading || !subdomainAvailable}
                          className="w-full h-12 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                          style={{ 
                            background: 'linear-gradient(to right, #14213D, #1a2d52)',
                          }}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Creating account...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Zap className="w-5 h-5" style={{ color: '#FCA311' }} />
                              <span>Create Account</span>
                            </div>
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our{' '}
                  <a href="#" className="transition-colors font-medium" style={{ color: '#FCA311' }}>
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="transition-colors font-medium" style={{ color: '#FCA311' }}>
                    Privacy Policy
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo credentials hint */}
          <motion.div 
            className="mt-6 p-5 rounded-2xl shadow-md"
            style={{
              background: 'linear-gradient(to right, rgba(252, 163, 17, 0.08), rgba(252, 163, 17, 0.12))',
              borderColor: '#FCA311',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #14213D, #1a2d52)' }}>
                <Zap className="w-6 h-6" style={{ color: '#FCA311' }} />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-bold mb-1">🚀 Zero-Config Demo Ready</p>
                <p className="text-sm text-gray-600">
                  Try any email/password to experience instant workspace creation
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mobile ZCPC preview */}
          <motion.div 
            className="lg:hidden mt-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: '#FCA311' }} />
              14-Step Auto-Creation
            </h3>
            <div className="space-y-2 text-xs">
              {keyHighlights.slice(0, 6).map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: '#FCA311' }} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center font-medium">+ 8 more automated steps</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}