import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, Download, CheckCircle, Clock, ClipboardList, AlertCircle, Upload, X } from 'lucide-react';

interface Question {
  id: string;
  prompt: string;
  field_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'multi-select' | 'number' | 'yesno' | 'date' | 'file';
  options?: string[];
  required?: boolean;
  min?: number;
}

interface Category {
  id: string;
  title: string;
  subtitle?: string;
  questions: Question[];
  when?: (answers: Record<string, any>) => boolean;
}

interface FileUpload {
  fileId: string;
  name: string;
  size: number;
  type: string;
}

// New questionnaire structure with dynamic sections
const questionnaireCategories: Category[] = [
  {
    id: 'locations',
    title: 'Locations & Remote Sites',
    questions: [
      { 
        id: 'Q1', 
        prompt: 'What are your countries of operation?', 
        field_type: 'textarea', 
        required: true 
      },
      { 
        id: 'Q2', 
        prompt: 'Do all branches have internet connectivity?', 
        field_type: 'radio', 
        options: ['Yes', 'No', 'Other'], 
        required: true 
      },
      { 
        id: 'Q3', 
        prompt: 'How many Disaster Recovery (DR) sites are currently in place?', 
        field_type: 'number', 
        min: 0 
      },
      { 
        id: 'Q4', 
        prompt: 'Which sites are connected to the Head Office (HO)?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q5', 
        prompt: 'Which sites are interconnected, and which ones operate in isolation?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q6', 
        prompt: 'What type of connectivity is used between sites (VPN/MPLS/direct/etc.)?', 
        field_type: 'textarea' 
      }
    ]
  },
  {
    id: 'cloud',
    title: 'Cloud Infrastructure',
    questions: [
      { 
        id: 'Q7', 
        prompt: 'Are you currently utilizing cloud infrastructure?', 
        field_type: 'yesno', 
        required: true 
      }
    ]
  },
  {
    id: 'cloud_details',
    title: 'Cloud Infrastructure Details',
    when: (answers) => answers['Q7'] === 'Yes',
    questions: [
      { 
        id: 'Q8', 
        prompt: 'Is your infra entirely cloud or hybrid? If hybrid, how is integration done?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q9', 
        prompt: 'Which cloud service providers are within scope?', 
        field_type: 'multi-select', 
        options: ['Azure', 'AWS', 'GCP', 'OCI', 'Other'] 
      }
    ]
  },
  {
    id: 'azure',
    title: 'Azure Cloud Details',
    when: (answers) => answers['Q7'] === 'Yes' && Array.isArray(answers['Q9']) && answers['Q9'].includes('Azure'),
    questions: [
      { 
        id: 'Q10', 
        prompt: 'How many tenants/environments do you have?', 
        field_type: 'number', 
        min: 1 
      },
      { 
        id: 'Q11', 
        prompt: 'Which regions are resources deployed in?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q12', 
        prompt: 'How is access managed? (MFA, IP/geographic restrictions, etc.)', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q13', 
        prompt: 'What cloud services are you actively using?', 
        field_type: 'multi-select', 
        options: ['AI/ML', 'Analytics', 'Compute', 'Containers', 'Databases', 'Dev tools', 'DevOps', 'Hybrid/Multicloud', 'Identity', 'Integration', 'IoT', 'Mgmt/Governance', 'Media', 'Migration', 'Mixed reality', 'Mobile', 'Networking', 'Security', 'Storage', 'VDI', 'Web'] 
      },
      { 
        id: 'Q14', 
        prompt: 'What cloud-native security services are you using?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q15', 
        prompt: 'Are you hosting any web servers in the cloud? WAF in place? which vendor?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q16', 
        prompt: 'Are you hosting any other types of assets within your cloud infra?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q17', 
        prompt: 'Are any of the mentioned assets publicly accessible?', 
        field_type: 'yesno' 
      },
      { 
        id: 'Q18', 
        prompt: 'Upload asset list explaining internet accessibility', 
        field_type: 'file' 
      },
      { 
        id: 'Q19', 
        prompt: 'What subnets are configured in your cloud environment?', 
        field_type: 'textarea' 
      }
    ]
  },
  {
    id: 'aws',
    title: 'AWS Cloud Details',
    when: (answers) => answers['Q7'] === 'Yes' && Array.isArray(answers['Q9']) && answers['Q9'].includes('AWS'),
    questions: [
      { 
        id: 'Q20', 
        prompt: 'How many tenants/environments?', 
        field_type: 'number', 
        min: 1 
      },
      { 
        id: 'Q21', 
        prompt: 'Regions in use?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q22', 
        prompt: 'Access control policies?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q23', 
        prompt: 'Cloud services in use?', 
        field_type: 'multi-select', 
        options: ['ML/AI', 'Analytics', 'Compute', 'Databases', 'Dev tools', 'Networking & CDN', 'App Integration', 'Migration & Transfer', 'Mgmt & Monitoring', 'Security/Identity/Compliance', 'Storage'] 
      },
      { 
        id: 'Q24', 
        prompt: 'Cloud-native security services?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q25', 
        prompt: 'Web servers hosted? WAF vendor?', 
        field_type: 'text' 
      },
      { 
        id: 'Q26', 
        prompt: 'Other asset types hosted?', 
        field_type: 'textarea' 
      },
      { 
        id: 'Q27', 
        prompt: 'Any public-facing assets?', 
        field_type: 'yesno' 
      },
      { 
        id: 'Q28', 
        prompt: 'Upload asset list (internet accessibility)', 
        field_type: 'file' 
      },
      { 
        id: 'Q29', 
        prompt: 'Configured subnets?', 
        field_type: 'textarea' 
      }
    ]
  },
  {
    id: 'gcp',
    title: 'GCP Cloud',
    when: (answers) => answers['Q7'] === 'Yes' && Array.isArray(answers['Q9']) && answers['Q9'].includes('GCP'),
    questions: [
      { 
        id: 'Q30', 
        prompt: 'Are you utilizing GCP Cloud?', 
        field_type: 'yesno' 
      }
    ]
  },
  {
    id: 'oci',
    title: 'OCI Cloud',
    when: (answers) => answers['Q7'] === 'Yes' && Array.isArray(answers['Q9']) && answers['Q9'].includes('OCI'),
    questions: [
      { 
        id: 'Q31', 
        prompt: 'Are you utilizing OCI Cloud?', 
        field_type: 'yesno' 
      }
    ]
  },
  {
    id: 'security',
    title: 'Security Solutions',
    questions: [
      { 
        id: 'Q32', 
        prompt: 'What Security Solution are you using?', 
        field_type: 'multi-select', 
        options: ['Network Security', 'Web Proxy', 'Email Proxy', 'Endpoint Protection', 'MDM', 'DNS Security', 'IoT Security', 'Other'] 
      }
    ]
  }
];

const OnboardingQuestionnaire: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});

  // Load answers from localStorage on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem('onboarding-answers-v2');
    const savedOtherTexts = localStorage.getItem('onboarding-other-texts');
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (error) {
        console.error('Failed to load saved answers:', error);
      }
    }
    if (savedOtherTexts) {
      try {
        setOtherTexts(JSON.parse(savedOtherTexts));
      } catch (error) {
        console.error('Failed to load saved other texts:', error);
      }
    }
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(answers).length > 0) {
        saveAnswers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [answers, otherTexts]);

  // Get visible categories based on current answers
  const getVisibleCategories = () => {
    return questionnaireCategories.filter(category => {
      if (!category.when) return true;
      return category.when(answers);
    });
  };

  // Clear answers for hidden sections
  useEffect(() => {
    const visibleCategories = getVisibleCategories();
    const visibleQuestionIds = new Set(
      visibleCategories.flatMap(cat => cat.questions.map(q => q.id))
    );

    // Clear answers for questions that are no longer visible
    const updatedAnswers = { ...answers };
    let hasChanges = false;

    Object.keys(updatedAnswers).forEach(questionId => {
      if (!visibleQuestionIds.has(questionId)) {
        delete updatedAnswers[questionId];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setAnswers(updatedAnswers);
    }
  }, [answers]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Update answer
  const updateAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Update other text for multi-select with "Other" option
  const updateOtherText = (questionId: string, text: string) => {
    setOtherTexts(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  // Get answered/total count for a category
  const getCategoryProgress = (category: Category) => {
    const answered = category.questions.filter(q => {
      const answer = answers[q.id];
      return answer !== undefined && answer !== null && answer !== '';
    }).length;
    return { answered, total: category.questions.length };
  };

  // Save answers
  const saveAnswers = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('onboarding-answers-v2', JSON.stringify(answers));
      localStorage.setItem('onboarding-other-texts', JSON.stringify(otherTexts));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save answers:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Export to JSON
  const exportToJSON = () => {
    const visibleCategories = getVisibleCategories();
    const exportData = {
      timestamp: new Date().toISOString(),
      answers: answers,
      otherTexts: otherTexts,
      meta: {
        visibleSections: visibleCategories.map(cat => cat.id),
        progress: overallProgress(),
        categories: visibleCategories.map(cat => ({
          id: cat.id,
          title: cat.title,
          progress: getCategoryProgress(cat)
        }))
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-questionnaire-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = (questionId: string, file: File) => {
    const fileData: FileUpload = {
      fileId: `file-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type
    };
    updateAnswer(questionId, fileData);
  };

  // Remove file
  const removeFile = (questionId: string) => {
    updateAnswer(questionId, null);
  };

  // Get selected providers for subtitle
  const getSelectedProviders = () => {
    const providers = answers['Q9'];
    if (!Array.isArray(providers) || providers.length === 0) return '';
    return `Selected: ${providers.join(', ')}`;
  };

  // Render input field based on type
  const renderInput = (question: Question) => {
    const value = answers[question.id] || '';
    const baseClasses = "w-full bg-[#0B0F1A]/50 border border-white/8 rounded-lg px-3 py-2 text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200";

    switch (question.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={baseClasses}
            placeholder="Enter your answer..."
          />
        );

      case 'textarea':
        return (
          <textarea
            rows={3}
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={`${baseClasses} resize-none`}
            placeholder="Enter your answer..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            min={question.min || 0}
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={baseClasses}
            placeholder="Enter a number..."
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={baseClasses}
          />
        );

      case 'yesno':
        return (
          <div className="flex space-x-4">
            {['Yes', 'No'].map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50"
                />
                <span className="text-[#E9EEF6]">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <div key={option}>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                    className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 focus:ring-[#14D8C4]/50"
                  />
                  <span className="text-[#E9EEF6]">{option}</span>
                </label>
                {option === 'Other' && value === 'Other' && (
                  <input
                    type="text"
                    value={otherTexts[question.id] || ''}
                    onChange={(e) => updateOtherText(question.id, e.target.value)}
                    placeholder="Please specify..."
                    className={`${baseClasses} mt-2 ml-6`}
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={baseClasses}
          >
            <option value="">Select an option...</option>
            {question.options?.map(option => (
              <option key={option} value={option} className="bg-[#111726] text-white">
                {option}
              </option>
            ))}
          </select>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {question.options?.map(option => (
                <div key={option}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, option]
                          : selectedValues.filter(v => v !== option);
                        updateAnswer(question.id, newValues);
                      }}
                      className="w-4 h-4 text-[#14D8C4] bg-[#0B0F1A] border-white/20 rounded focus:ring-[#14D8C4]/50"
                    />
                    <span className="text-[#E9EEF6]">{option}</span>
                  </label>
                  {option === 'Other' && selectedValues.includes('Other') && (
                    <input
                      type="text"
                      value={otherTexts[question.id] || ''}
                      onChange={(e) => updateOtherText(question.id, e.target.value)}
                      placeholder="Please specify..."
                      className={`${baseClasses} mt-2 ml-6`}
                    />
                  )}
                </div>
              ))}
            </div>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedValues.map((selected, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30"
                  >
                    {selected}
                    {selected === 'Other' && otherTexts[question.id] && `: ${otherTexts[question.id]}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'file':
        const fileData = value as FileUpload | null;
        return (
          <div className="space-y-3">
            {!fileData ? (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#14D8C4]/50 transition-colors">
                <Upload className="h-8 w-8 text-[#A7B0C0] mx-auto mb-2" />
                <p className="text-[#A7B0C0] mb-2">Upload file</p>
                <p className="text-xs text-[#A7B0C0] mb-3">Word, Excel, PowerPoint, PDF, Image, Video, Audio</p>
                <input
                  type="file"
                  accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3,.wav"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(question.id, file);
                    }
                  }}
                  className="hidden"
                  id={`file-${question.id}`}
                />
                <label
                  htmlFor={`file-${question.id}`}
                  className="inline-flex items-center px-4 py-2 bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 rounded-lg hover:bg-[#14D8C4]/30 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            ) : (
              <div className="bg-[#0B0F1A]/50 border border-white/8 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Upload className="h-5 w-5 text-[#14D8C4]" />
                    <div>
                      <p className="text-[#E9EEF6] font-medium">{fileData.name}</p>
                      <p className="text-xs text-[#A7B0C0]">
                        {(fileData.size / 1024).toFixed(1)} KB • {fileData.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(question.id)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={baseClasses}
            placeholder="Enter your answer..."
          />
        );
    }
  };

  // Calculate overall progress (visible questions only)
  const overallProgress = () => {
    const visibleCategories = getVisibleCategories();
    const totalQuestions = visibleCategories.reduce((sum, cat) => sum + cat.questions.length, 0);
    const answeredQuestions = visibleCategories.reduce((sum, cat) => {
      const { answered } = getCategoryProgress(cat);
      return sum + answered;
    }, 0);
    return { answered: answeredQuestions, total: totalQuestions };
  };

  const { answered: totalAnswered, total: totalQuestions } = overallProgress();
  const visibleCategories = getVisibleCategories();

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#E9EEF6] flex items-center">
            <ClipboardList className="h-8 w-8 mr-3 text-[#14D8C4]" />
            Onboarding Questionnaire
          </h1>
          <p className="text-[#A7B0C0] mt-2">Questions adapt to your setup — irrelevant sections stay hidden</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToJSON}
            className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#E9EEF6] mb-2">Overall Progress</h2>
            <p className="text-[#A7B0C0]">{totalAnswered} of {totalQuestions} questions answered</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-32 bg-slate-800 rounded-full h-3">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] transition-all duration-1000 ease-out"
                style={{ width: `${totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-[#14D8C4] font-medium">
              {totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0}%
            </span>
          </div>
        </div>
        {lastSaved && (
          <div className="mt-4 flex items-center text-sm text-[#A7B0C0]">
            <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
            Last saved: {lastSaved.toLocaleString()}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {visibleCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const { answered, total } = getCategoryProgress(category);
          const isComplete = answered === total && total > 0;
          
          return (
            <div key={category.id} className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-[#0B0F1A]/30 transition-colors duration-200 rounded-2xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-[#A7B0C0]" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-[#A7B0C0]" />
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-[#E9EEF6]">{category.title}</h3>
                      {category.id === 'cloud_details' && getSelectedProviders() && (
                        <p className="text-sm text-[#14D8C4] mt-1">{getSelectedProviders()}</p>
                      )}
                    </div>
                  </div>
                  {isComplete && (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    isComplete 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : answered > 0
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {answered}/{total}
                  </span>
                </div>
              </button>

              {/* Category Questions */}
              {isExpanded && (
                <div className="border-t border-white/8 p-6 space-y-6">
                  {category.questions.map((question) => {
                    const hasAnswer = answers[question.id] !== undefined && answers[question.id] !== null && answers[question.id] !== '';
                    
                    return (
                      <div key={question.id} className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <label className="text-sm font-medium text-[#E9EEF6] flex-1">
                            {question.prompt}
                            {question.required && <span className="text-[#FF2D78] ml-1">*</span>}
                          </label>
                          {hasAnswer && (
                            <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                        {renderInput(question)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={saveAnswers}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
        >
          {isSaving ? (
            <Clock className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
        </button>
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;