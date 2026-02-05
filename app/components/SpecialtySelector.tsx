"use client";

import { useState } from 'react';
import { Heart, Eye, Activity, Brain, Bone, Users } from 'lucide-react';

interface SpecialtySelectorProps {
  onSpecialtyChange: (specialty: string) => void;
  selectedSpecialty: string;
}

const specialties = [
  { name: 'Ophthalmology', icon: Eye, color: 'blue', description: 'Eye care and vision' },
  { name: 'Cardiology', icon: Heart, color: 'red', description: 'Heart and cardiovascular' },
  { name: 'Dermatology', icon: Activity, color: 'orange', description: 'Skin conditions' },
  { name: 'Neurology', icon: Brain, color: 'purple', description: 'Brain and nervous system' },
  { name: 'Orthopedics', icon: Bone, color: 'green', description: 'Bones and joints' },
  { name: 'General Medicine', icon: Users, color: 'gray', description: 'General practice' },
];

export function SpecialtySelector({ onSpecialtyChange, selectedSpecialty }: SpecialtySelectorProps) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Select Report Type</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {specialties.map((specialty) => {
          const Icon = specialty.icon;
          const isSelected = selectedSpecialty === specialty.name;
          
          return (
            <button
              key={specialty.name}
              onClick={() => onSpecialtyChange(specialty.name)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                isSelected
                  ? `border-${specialty.color}-500 bg-${specialty.color}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${
                isSelected ? `text-${specialty.color}-600` : 'text-gray-400'
              }`} />
              <h4 className={`font-semibold text-sm mb-1 ${
                isSelected ? `text-${specialty.color}-900` : 'text-gray-800'
              }`}>
                {specialty.name}
              </h4>
              <p className="text-xs text-gray-600">
                {specialty.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
