import { RiskLevel, RiskSignal } from '../types';

export function calculateRiskScore(signals: RiskSignal[]): number {
  const baseScore = 50;
  const totalDelta = signals.reduce((acc, signal) => acc + signal.scoreDelta, 0);
  const finalScore = Math.min(100, Math.max(0, baseScore + totalDelta));
  return finalScore;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function getRiskLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'critical':
      return 'Critical Risk';
    case 'high':
      return 'High Risk';
    case 'medium':
      return 'Medium Risk';
    case 'low':
      return 'Low Risk';
    case 'cleared':
      return 'Cleared / Normal';
  }
}

export function getRiskColorClasses(risk: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
} {
  switch (risk) {
    case 'critical':
      return {
        bg: 'bg-[#F43F5E]/10',
        text: 'text-[#F43F5E]',
        border: 'border-[#F43F5E]',
        badgeBg: 'bg-[#F43F5E]',
        badgeText: 'text-white',
        dotColor: '#F43F5E',
      };
    case 'high':
      return {
        bg: 'bg-[#FB923C]/10',
        text: 'text-[#FB923C]',
        border: 'border-[#FB923C]',
        badgeBg: 'bg-[#FB923C]',
        badgeText: 'text-[#0B0E14]',
        dotColor: '#FB923C',
      };
    case 'medium':
      return {
        bg: 'bg-[#FBBF24]/10',
        text: 'text-[#FBBF24]',
        border: 'border-[#FBBF24]',
        badgeBg: 'bg-[#FBBF24]',
        badgeText: 'text-[#0B0E14]',
        dotColor: '#FBBF24',
      };
    case 'low':
    case 'cleared':
      return {
        bg: 'bg-[#34D399]/10',
        text: 'text-[#34D399]',
        border: 'border-[#34D399]',
        badgeBg: 'bg-[#34D399]',
        badgeText: 'text-[#0B0E14]',
        dotColor: '#34D399',
      };
  }
}
