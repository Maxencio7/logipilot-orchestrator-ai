
import React, { useState } from 'react';
import { Brain, Send, Mic, FileText, Package, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const AIAssistant = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickActions = [
    {
      icon: Package,
      title: 'Generate Shipping Label',
      description: 'Create optimized shipping labels with AI',
      action: 'generate-label'
    },
    {
      icon: FileText,
      title: 'Process Document',
      description: 'Extract data from shipping documents',
      action: 'process-document'
    },
    {
      icon: Zap,
      title: 'Route Optimization',
      description: 'AI-powered route planning and optimization',
      action: 'optimize-route'
    },
    {
      icon: Brain,
      title: 'Predictive Analytics',
      description: 'Forecast demand and shipping patterns',
      action: 'analytics'
    }
  ];

  const conversationHistory = [
    {
      type: 'user',
      message: 'What is the status of shipment SH001?',
      timestamp: '10:30 AM'
    },
    {
      type: 'ai',
      message: 'Shipment SH001 is currently in transit from our Chicago facility to New York. Expected delivery is tomorrow at 2:00 PM. The package contains electronics for TechCorp Inc. and is being transported via our priority express service.',
      timestamp: '10:30 AM'
    },
    {
      type: 'user',
      message: 'Generate a shipping label for urgent delivery to Los Angeles',
      timestamp: '10:32 AM'
    },
    {
      type: 'ai',
      message: 'I\'ve generated an optimized shipping label for urgent delivery to Los Angeles. The system selected our fastest route via air freight with ground connection. Estimated delivery: 24 hours. Label includes tracking number UL789456123 and has been sent to your printer queue.',
      timestamp: '10:32 AM'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setQuery('');
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <Brain className="w-8 h-8 mr-3 text-logistics-primary" />
          AI Assistant
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-600">AI Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div
                    key={index}
                    className="p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-logistics-primary/10 rounded-lg">
                        <Icon className="w-4 h-4 text-logistics-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{action.title}</p>
                        <p className="text-xs text-slate-600">{action.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="card-hover h-96">
            <CardHeader>
              <CardTitle>AI Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {conversationHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-logistics-primary text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-logistics-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-logistics-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-logistics-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-slate-600 ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask AI about shipments, generate labels, or get insights..."
                    className="pr-10"
                    disabled={isProcessing}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
                <Button type="submit" disabled={isProcessing || !query.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Capabilities */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>AI Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Smart Logistics</h3>
              <p className="text-sm text-slate-600">Automated label generation, route optimization, and delivery predictions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Natural Language</h3>
              <p className="text-sm text-slate-600">Process queries in plain English and provide intelligent responses</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Real-time Processing</h3>
              <p className="text-sm text-slate-600">Instant analysis of shipping data and automated decision making</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
