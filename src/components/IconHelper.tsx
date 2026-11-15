import React from 'react';
import {
  Moon,
  MessageCircle,
  Home,
  Sun,
  Music,
  Flower2,
  Heart,
  UtensilsCrossed,
  Film,
  Wine,
  Crown,
  Coffee,
  Bookmark,
  Compass,
  Smile,
  ShieldCheck,
  Flame,
  Camera,
  Gift,
  Clock,
  Send,
  MessageSquareHeart,
  Award
} from 'lucide-react';

export type IconKey =
  | 'moon'
  | 'message'
  | 'home'
  | 'sun'
  | 'music'
  | 'flower'
  | 'heart'
  | 'utensils'
  | 'film'
  | 'wine'
  | 'crown'
  | 'coffee'
  | 'bookmark'
  | 'compass'
  | 'smile'
  | 'shield'
  | 'flame'
  | 'camera'
  | 'gift'
  | 'clock'
  | 'send'
  | 'banter'
  | 'award';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name.toLowerCase()) {
    case 'moon':
      return <Moon className={className} />;
    case 'message':
      return <MessageCircle className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'sun':
      return <Sun className={className} />;
    case 'music':
      return <Music className={className} />;
    case 'flower':
      return <Flower2 className={className} />;
    case 'utensils':
      return <UtensilsCrossed className={className} />;
    case 'film':
      return <Film className={className} />;
    case 'wine':
      return <Wine className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'bookmark':
      return <Bookmark className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'smile':
      return <Smile className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'camera':
      return <Camera className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'send':
      return <Send className={className} />;
    case 'banter':
      return <MessageSquareHeart className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'heart':
    default:
      return <Heart className={className} />;
  }
};
