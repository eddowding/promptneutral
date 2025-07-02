import React from 'react';
import { TreePine, Wind, Factory, MapPin, Star, Award, ExternalLink } from 'lucide-react';
import { OnboardingData } from './OnboardingWizard';

interface ProjectsStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface Project {
  id: string;
  type: 'forest' | 'renewable' | 'direct-capture';
  name: string;
  location: string;
  description: string;
  price: number; // USD per tonne CO2
  rating: number;
  certification: string;
  impact: string;
  image: string;
  featured?: boolean;
}

const projects: Project[] = [
  {
    id: 'amazon-forest-conservation',
    type: 'forest',
    name: 'Amazon Forest Conservation',
    location: 'Brazil',
    description: 'Protecting 50,000 hectares of Amazon rainforest while supporting indigenous communities',
    price: 12,
    rating: 4.9,
    certification: 'Gold Standard',
    impact: '2.5M tonnes CO₂ annually',
    image: '🌳',
    featured: true,
  },
  {
    id: 'wind-power-india',
    type: 'renewable',
    name: 'Wind Power Generation',
    location: 'Gujarat, India',
    description: 'Large-scale wind farm providing clean energy to 200,000 households',
    price: 8,
    rating: 4.8,
    certification: 'Verra VCS',
    impact: '180,000 tonnes CO₂ annually',
    image: '💨',
  },
  {
    id: 'direct-air-capture-iceland',
    type: 'direct-capture',
    name: 'Direct Air Capture',
    location: 'Iceland',
    description: 'Advanced DAC technology permanently removing CO₂ from the atmosphere',
    price: 85,
    rating: 4.7,
    certification: 'Gold Standard',
    impact: '4,000 tonnes CO₂ annually',
    image: '🏭',
    featured: true,
  },
  {
    id: 'mangrove-restoration',
    type: 'forest',
    name: 'Mangrove Restoration',
    location: 'Indonesia',
    description: 'Restoring coastal mangrove ecosystems for climate resilience and biodiversity',
    price: 15,
    rating: 4.8,
    certification: 'Plan Vivo',
    impact: '125,000 tonnes CO₂ annually',
    image: '🌊',
  },
  {
    id: 'solar-power-kenya',
    type: 'renewable',
    name: 'Solar Power Plant',
    location: 'Kenya',
    description: 'Utility-scale solar installation bringing clean energy to rural communities',
    price: 10,
    rating: 4.6,
    certification: 'Gold Standard',
    impact: '95,000 tonnes CO₂ annually',
    image: '☀️',
  },
  {
    id: 'biochar-production',
    type: 'direct-capture',
    name: 'Biochar Production',
    location: 'California, USA',
    description: 'Converting agricultural waste into biochar for permanent carbon storage',
    price: 45,
    rating: 4.5,
    certification: 'Verra VCS',
    impact: '12,000 tonnes CO₂ annually',
    image: '⚫',
  },
];

const projectTypes = [
  {
    type: 'forest' as const,
    name: 'Forest & Nature',
    icon: <TreePine className="w-6 h-6" />,
    description: 'Forest conservation, reforestation, and ecosystem restoration',
    color: 'green',
  },
  {
    type: 'renewable' as const,
    name: 'Renewable Energy',
    icon: <Wind className="w-6 h-6" />,
    description: 'Solar, wind, and other clean energy projects',
    color: 'blue',
  },
  {
    type: 'direct-capture' as const,
    name: 'Direct Capture',
    icon: <Factory className="w-6 h-6" />,
    description: 'Technology-based carbon removal and storage',
    color: 'purple',
  },
];

export const ProjectsStep: React.FC<ProjectsStepProps> = ({
  data,
  updateData,
  onNext,
}) => {
  const [selectedType, setSelectedType] = React.useState<'forest' | 'renewable' | 'direct-capture' | null>(null);

  const selectProject = (project: Project) => {
    updateData({
      project: {
        type: project.type,
        projectId: project.id,
        name: project.name,
      },
    });
  };

  const filteredProjects = selectedType 
    ? projects.filter(p => p.type === selectedType)
    : projects;

  const canContinue = data.project.projectId !== '';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Impact Project
        </h1>
        <p className="text-lg text-gray-600">
          Select a verified carbon offset project that aligns with your values. 
          All projects are certified by leading standards.
        </p>
      </div>

      {/* Project Type Filter */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projectTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => setSelectedType(selectedType === type.type ? null : type.type)}
              className={`p-4 border rounded-xl text-left transition-colors ${
                selectedType === type.type
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                selectedType === type.type
                  ? `bg-${type.color}-100 text-${type.color}-600`
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {type.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedType ? `${projectTypes.find(t => t.type === selectedType)?.name} Projects` : 'All Projects'}
          </h2>
          {selectedType && (
            <button
              onClick={() => setSelectedType(null)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All Projects
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isSelected = data.project.projectId === project.id;
            const typeColor = projectTypes.find(t => t.type === project.type)?.color || 'gray';
            
            return (
              <div
                key={project.id}
                className={`border rounded-xl overflow-hidden transition-all cursor-pointer ${
                  isSelected
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => selectProject(project)}
              >
                {project.featured && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium px-3 py-1 text-center">
                    Most Popular
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{project.image}</span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{project.location}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">${project.price}/tonne CO₂</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{project.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Impact:</span>
                      <span className="font-medium">{project.impact}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 bg-${typeColor}-100 text-${typeColor}-700 text-xs font-medium rounded-full`}>
                      {project.certification}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Project Summary */}
      {canContinue && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-green-900 mb-2">Selected Project</h3>
          <p className="text-green-700">
            <strong>{data.project.name}</strong> - Your carbon emissions will be offset 
            through this verified project with immediate retirement of credits.
          </p>
        </div>
      )}

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            canContinue
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canContinue ? 'Continue to Tour' : 'Select a Project'}
        </button>
        {canContinue && (
          <p className="text-sm text-gray-500 mt-2">
            You can change your project selection anytime from settings
          </p>
        )}
      </div>
    </div>
  );
};