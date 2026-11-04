import React, { useState } from 'react';
import { useRidePlatform } from '../../context/RidePlatformContext';
import { Star, Heart, ThumbsUp, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RatingModalProps {
  isOpen: boolean;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen }) => {
  const { activeRide, submitRating } = useRidePlatform();
  const [stars, setStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['قيادة آمنة ومريحة', 'سيارة نظيفة']);
  const [tipAmount, setTipAmount] = useState<number>(5);
  const [customComment, setCustomComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !activeRide || activeRide.status !== 'completed') return null;

  const availableTags = [
    'قيادة آمنة ومريحة',
    'سيارة نظيفة ومرتبة',
    'التزام تام بالمسار',
    'أخلاق عالية ولباقة',
    'موسيقى هادئة وتكييف ممتاز',
    'وصول سريع ودقيق',
  ];

  const tipOptions = [0, 5, 10, 15, 20];

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    } catch {}

    setIsSubmitted(true);
    setTimeout(() => {
      submitRating(stars, customComment, selectedTags, tipAmount);
      setIsSubmitted(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {isSubmitted ? (
          <div className="py-12 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">شكراً لك على تقييمك!</h3>
            <p className="text-sm text-slate-400">
              ملاحظاتك تساعدنا في تقديم تجربة قيادة وتنقل استثنائية دائماً
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Driver Info */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={
                    activeRide.driver?.avatar ||
                    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80'
                  }
                  alt={activeRide.driver?.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-slate-800 shadow-xl"
                />
                <span className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 p-1 rounded-full text-xs font-bold shadow">
                  ★
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">كيف كانت رحلتك مع {activeRide.driver?.name}؟</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeRide.driver?.vehicle.make} {activeRide.driver?.vehicle.model} • مشوار {activeRide.distanceKm} كم ({activeRide.price} ج.م)
              </p>
            </div>

            {/* Stars selection */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = (hoveredStars ?? stars) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onMouseEnter={() => setHoveredStars(starValue)}
                    onMouseLeave={() => setHoveredStars(null)}
                    onClick={() => setStars(starValue)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Tags badges */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 text-right">ما الذي أعجبك أكثر في الرحلة؟</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {availableTags.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tip selector */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-right">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  إكرامية إضافية للكابتن (Tip)
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {tipAmount > 0 ? `+${tipAmount} ج.م` : 'بدون إكرامية'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {tipOptions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTipAmount(amount)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      tipAmount === amount
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {amount === 0 ? 'لا شيء' : `${amount} ج.م`}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments input */}
            <textarea
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="أضف تعليقاً لطيفاً أو ملاحظاتك..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none"
            />

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>إرسال التقييم وإنهاء الرحلة</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
