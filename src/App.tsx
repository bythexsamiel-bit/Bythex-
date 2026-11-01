import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  MessageCircle,
  Search,
  Video,
  User as UserIcon,
  Bell,
  Heart,
  MessageSquare,
  Share2,
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Download,
  Copy,
  RefreshCw,
  LogOut,
  Lock,
  Mail,
  ArrowRight,
  Check,
  AlertCircle,
  Trash2,
  Send,
  ArrowLeft,
  Wifi,
  Tv,
  Gift,
  Settings,
  CreditCard,
  Smartphone,
  Shield,
  Moon,
  Globe,
  HelpCircle,
  BarChart2,
  DollarSign,
  Users,
  Eye,
  EyeOff,
  Plus,
  Camera,
  MapPin,
  Tag,
  Verified,
  Music,
  Play,
  ChevronRight,
  X,
  Zap,
  Edit3,
  WifiOff,
  Phone,
  MoreVertical
} from 'lucide-react';

interface PostItem {
  id: string;
  userId?: string;
  name: string;
  message: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  image?: string;
  song?: string;
  views?: number;
  boosted?: boolean;
  boostAmount?: number;
  boostCurrency?: string;
  boostGoal?: string;
  boostStatus?: string;
}

interface StoryItem {
  name: string;
  views: number;
  likes: number;
  cries: number;
}

const LowDataService = {
  isEnabled: () => localStorage.getItem('low_data_mode') === 'true',
  setEnabled: (val: boolean) => localStorage.setItem('low_data_mode', String(val))
};

interface BythexImageProps {
  normalUrl: string;
  lowDataUrl?: string;
  className?: string;
  alt?: string;
}

const BythexImage: React.FC<BythexImageProps> = ({ normalUrl, lowDataUrl, className, alt }) => {
  const [lowData] = useState<boolean>(() => LowDataService.isEnabled());
  const imageUrl = lowData && lowDataUrl ? lowDataUrl : normalUrl;

  return (
    <img
      src={imageUrl}
      alt={alt || 'Bythex media'}
      className={className || 'w-full h-full object-cover'}
      loading="lazy"
    />
  );
};

const CircularBythexBrand: React.FC<{ size?: number; className?: string }> = ({ size = 160, className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 160 160" className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
        <defs>
          <path id="textPath" d="M 80, 80 m -60, 0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0" />
        </defs>
        <text fill="#60a5fa" fontSize="12.5" fontWeight="bold" letterSpacing="3.8">
          <textPath href="#textPath" startOffset="0%">
            BYTHEX • BYTHEX • BYTHEX •
          </textPath>
        </text>
      </svg>
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/40 z-10">
        <span className="text-white font-extrabold text-base tracking-wider">BX</span>
      </div>
    </div>
  );
};

const compressImageToLowData = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 320;
        const MAX_HEIGHT = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to ~0.02MB (20KB) ultra-lightweight JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.35);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    if (!window.location.hash.includes('bythex/sami')) {
      window.location.hash = '#/bythex/sami';
    }
    return () => clearTimeout(timer);
  }, []);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'create'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone');
  const [authEmail, setAuthEmail] = useState<string>('bythexsamiel@gmail.com');
  const [phoneInput, setPhoneInput] = useState<string>('0712345678');
  const [authPassword, setAuthPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [firstNameInput, setFirstNameInput] = useState<string>('Samiel');
  const [secondNameInput, setSecondNameInput] = useState<string>('Developer');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);
  const [forgotPhone, setForgotPhone] = useState<string>('0712345678');
  const [otpCodeSent, setOtpCodeSent] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  
  // Security & failed attempts suspension state
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try { return Number(localStorage.getItem('bythex_failed_attempts') || '0'); } catch { return 0; }
  });
  const [suspendedUntil, setSuspendedUntil] = useState<number | null>(() => {
    try {
      const val = localStorage.getItem('bythex_suspended_until');
      return val ? Number(val) : null;
    } catch { return null; }
  });
  
  // Create Username Step state
  const [showUsernameStep, setShowUsernameStep] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('samiel');
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean>(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('home');

  // Verification state
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Profile & Bio state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userBio, setUserBio] = useState<string>('Welcome to my Bythex profile!');
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [bioInput, setBioInput] = useState<string>(userBio);
  const [viewingUserProfile, setViewingUserProfile] = useState<{
    name: string;
    isVerified?: boolean;
    bio?: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Sliders
  const [showBundlesModal, setShowBundlesModal] = useState<boolean>(false);
  const [showStripeModal, setShowStripeModal] = useState<boolean>(false);
  const [stripeProduct, setStripeProduct] = useState<string>('verification');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('123');
  const [savedCard, setSavedCard] = useState<{ last4: string; expiry: string } | null>({ last4: '4242', expiry: '12/28' });
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [showMpesaModal, setShowMpesaModal] = useState<boolean>(false);
  const [mpesaPhone, setMpesaPhone] = useState<string>('254712345678');
  const [mpesaLoading, setMpesaLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [receivedGifts, setReceivedGifts] = useState<Array<{ name: string; price: number; sender: string; time: string; method: string }>>([
    { name: '👑 Crown', price: 10, sender: 'Joseph', time: '10m ago', method: 'M-Pesa (0141422771)' },
    { name: '💎 Diamond', price: 5, sender: 'Mary', time: '1h ago', method: 'Bank Account Tie' },
  ]);
  const [selectedGiftForPayment, setSelectedGiftForPayment] = useState<{ name: string; price: number } | null>(null);
  const [showGiftPaymentModal, setShowGiftPaymentModal] = useState<boolean>(false);

  const payWithMpesa = async () => {
    if (!mpesaPhone.trim()) {
      showToast('Enter your M-PESA phone number');
      return;
    }
    setMpesaLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setShowMpesaModal(false);
      setIsVerified(true);
      showToast('M-PESA STK Push sent successfully! Verification activated 🔵');
    } catch (e) {
      showToast(`Payment failed: ${e}`);
    } finally {
      setMpesaLoading(false);
    }
  };

  // Call & Live Stream state
  const [activeCall, setActiveCall] = useState<'video' | 'voice' | null>(null);
  const [callMuted, setCallMuted] = useState<boolean>(false);
  const [videoMuted, setVideoMuted] = useState<boolean>(false);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [showEffectsSheet, setShowEffectsSheet] = useState<boolean>(false);
  const [beautyEnabled, setBeautyEnabled] = useState<boolean>(false);
  const [blurBgEnabled, setBlurBgEnabled] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('Normal');
  const [liveCommentsList, setLiveCommentsList] = useState<{ username: string; text: string }[]>([
    { username: 'Joseph', text: 'Amazing live stream! 🔥' },
    { username: 'Mary', text: 'Hello from Nairobi! ❤️' }
  ]);
  const [liveCommentInput, setLiveCommentInput] = useState<string>('');
  const [liveViewersCount] = useState<number>(1420);
  const [liveLikesCount, setLiveLikesCount] = useState<number>(3450);

  // Live Camera & Effects Ref & Stream
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const callVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    if (isLiveActive || activeTab === 'live' || activeCall === 'video') {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
        .then((s) => {
          currentStream = s;
          setCameraActive(true);
          setCameraError(null);
          if (liveVideoRef.current) {
            liveVideoRef.current.srcObject = s;
            liveVideoRef.current.play().catch(() => {});
          }
          if (callVideoRef.current) {
            callVideoRef.current.srcObject = s;
            callVideoRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('Camera access error:', err);
          setCameraActive(false);
          setCameraError('Camera simulation mode active');
        });
    } else {
      setCameraActive(false);
    }
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isLiveActive, activeTab, activeCall]);

  const requestCameraPermission = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = s;
        liveVideoRef.current.play().catch(() => {});
      }
      if (callVideoRef.current) {
        callVideoRef.current.srcObject = s;
        callVideoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setCameraError(null);
      alert('Camera permission granted successfully! Your camera feed is now active.');
    } catch (err: any) {
      console.warn('Camera permission error:', err);
      setCameraActive(false);
      setCameraError('Camera permission denied or unavailable');
      alert('Camera permission denied or unavailable. Please check your browser address bar settings to allow camera access.');
    }
  };

  const getFilterStyle = () => {
    let f = '';
    if (selectedFilter === 'Warm') f += 'sepia(0.35) saturate(1.4) ';
    if (selectedFilter === 'Cool') f += 'hue-rotate(180deg) saturate(1.3) ';
    if (selectedFilter === 'Bright') f += 'brightness(1.25) contrast(1.1) ';
    if (selectedFilter === 'Vintage') f += 'sepia(0.6) contrast(1.25) brightness(0.9) ';
    if (selectedFilter === 'Black & White') f += 'grayscale(1) ';
    if (selectedFilter === 'Cyberpunk') f += 'hue-rotate(290deg) saturate(2.2) contrast(1.4) ';
    if (beautyEnabled) f += 'blur(0.4px) brightness(1.2) contrast(1.05) ';
    return f.trim();
  };

  // Boost Post Modal state
  const [boostingPostId, setBoostingPostId] = useState<string | null>(null);
  const [boostBudget, setBoostBudget] = useState<number>(4);
  const [boostGoal, setBoostGoal] = useState<string>('followers');
  const [showBoostPayment, setShowBoostPayment] = useState<boolean>(false);

  // Feed & Stories state
  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: '1',
      userId: 'abc123',
      name: 'Joseph',
      message: 'My new post! Check out our latest creator community update.',
      likes: 120,
      isLiked: false,
      createdAt: '2h ago',
      song: 'Summer Vibes',
      views: 1250,
      boosted: true,
      boostAmount: 4,
      boostCurrency: 'USD',
      boostGoal: 'followers',
      boostStatus: 'active'
    },
    {
      id: '2',
      userId: 'def456',
      name: 'Mary',
      message: 'Having a great day! ❤️ Loving the verification badge and AI studio.',
      likes: 42,
      isLiked: true,
      createdAt: '4h ago',
      views: 320,
      boosted: false
    }
  ]);

  const [stories, setStories] = useState<StoryItem[]>([
    { name: 'Your Story', views: 125, likes: 42, cries: 5 },
    { name: 'Joseph', views: 850, likes: 210, cries: 18 },
    { name: 'Mary', views: 1200, likes: 340, cries: 25 },
    { name: 'Peter', views: 430, likes: 95, cries: 3 },
  ]);

  // Create Music Post state
  const [musicCaption, setMusicCaption] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [showSongPicker, setShowSongPicker] = useState<boolean>(false);
  const songsList = ['My Song', 'Summer Vibes', 'African Beat', 'Love Melody', 'Amapiano Vibe'];

  // Comments Page state
  const [commentsList, setCommentsList] = useState<{ id: string; username: string; text: string; likes: number; photo?: string; parentIndex?: number | null }[]>([
    { id: '1', username: 'Joseph', text: 'Incredible post! 🔥', likes: 5, parentIndex: null }
  ]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [selectedCommentPhoto, setSelectedCommentPhoto] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<string[]>(['John', 'Mary']);

  // Drafts state
  const [drafts, setDrafts] = useState<Array<{ caption: string; type: string }>>([
    { caption: 'My first Bythex post 🚀', type: 'Photo' },
    { caption: 'New video coming soon 🔥', type: 'Video' },
  ]);

  // Settings preferences states
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentLanguage, setCurrentLanguage] = useState<string>('English');
  const [supportMessage, setSupportMessage] = useState<string>('');

  // Saved accounts state for Account Switcher
  const [savedAccounts, setSavedAccounts] = useState<Array<{ uid: string; name: string; username: string; profileImage: string; active?: boolean }>>([
    { uid: 'account_1', name: 'Samiel', username: '@samiel', profileImage: '', active: true },
    { uid: 'account_2', name: 'Bythex Creator', username: '@bythex_creator', profileImage: '', active: false },
  ]);

  // Notifications state
  const [notificationsList, setNotificationsList] = useState<Array<{ id: string; title: string; body: string; time: string; type: string; read: boolean }>>([
    { id: '1', title: 'Joseph sent you a gift 🎁', body: 'Joseph sent a Crown gift on live stream', time: '10m ago', type: 'gift', read: false },
    { id: '2', title: 'Mary liked your post ❤️', body: 'Mary liked your Bythex post', time: '1h ago', type: 'like', read: false },
    { id: '3', title: 'Peter started following you', body: 'Peter is now following your updates', time: '3h ago', type: 'follow', read: true },
    { id: '4', title: 'New comment on your video', body: 'Nice picture 🔥', time: '5h ago', type: 'comment', read: true },
    { id: '5', title: 'Bythex update: AI Studio v2 is live', body: 'Explore new AI image and text generation features', time: '1d ago', type: 'system', read: true },
  ]);

  // Chat PIN lock per partner
  const [chatPins, setChatPins] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('bythex_chat_pins');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [unlockedChats, setUnlockedChats] = useState<Record<string, boolean>>({});
  const [showChatPinModal, setShowChatPinModal] = useState<boolean>(false);
  const [chatPinInput, setChatPinInput] = useState<string>('');
  const [targetPartnerForPin, setTargetPartnerForPin] = useState<string | null>(null);
  const [isSettingNewPin, setIsSettingNewPin] = useState<boolean>(false);
  const [pinShake, setPinShake] = useState<boolean>(false);

  // Story viewer modal state
  const [selectedStoryViewer, setSelectedStoryViewer] = useState<{ name: string; views: number; likes: number; cries: number } | null>(null);

  // Chat state
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, { type: 'text' | 'photo'; text?: string; file?: string }[]>>({
    'Joseph': [
      { type: 'text', text: 'Hey! Did you check out the new data bundles?' },
      { type: 'photo', file: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80' }
    ],
    'Mary': [{ type: 'text', text: 'Hello!' }],
    'Peter': [{ type: 'text', text: 'Hey there!' }]
  });
  const [chatInput, setChatInput] = useState<string>('');

  // Offline messaging queue & network status layer
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<{ recipient: string; msg: { type: 'text' | 'photo'; text?: string; file?: string }; timestamp: number }[]>(() => {
    try {
      const saved = localStorage.getItem('bythex_offline_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      try {
        const saved = localStorage.getItem('bythex_offline_messages');
        if (saved) {
          const queue: { recipient: string; msg: { type: 'text' | 'photo'; text?: string; file?: string } }[] = JSON.parse(saved);
          if (queue.length > 0) {
            setChatMessages(prev => {
              const updated = { ...prev };
              queue.forEach(item => {
                if (!updated[item.recipient]) updated[item.recipient] = [];
                updated[item.recipient] = [...updated[item.recipient], item.msg];
              });
              return updated;
            });
            localStorage.removeItem('bythex_offline_messages');
            setOfflineQueue([]);
            showToast(`Connection restored! Automatically sent ${queue.length} offline message(s) 🚀`);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('You are offline. Outgoing messages will be saved locally and sent when reconnected 📡');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSendMessage = (msg: { type: 'text' | 'photo'; text?: string; file?: string }) => {
    if (!activeChatUser) return;
    if (navigator.onLine && isOnline) {
      setChatMessages(prev => ({
        ...prev,
        [activeChatUser]: [...(prev[activeChatUser] || []), msg]
      }));
      showToast('Message sent');
    } else {
      const newItem = { recipient: activeChatUser, msg, timestamp: Date.now() };
      const nextQueue = [...offlineQueue, newItem];
      setOfflineQueue(nextQueue);
      try {
        localStorage.setItem('bythex_offline_messages', JSON.stringify(nextQueue));
      } catch (e) {
        console.error(e);
      }
      setChatMessages(prev => ({
        ...prev,
        [activeChatUser]: [...(prev[activeChatUser] || []), { ...msg, text: `${msg.text || '[Attachment]'} ⏳ (Saved offline)` }]
      }));
      showToast('Offline: Message saved in local storage. Will auto-send on reconnection 📡');
    }
  };

  // Live interaction state
  const [liveComments, setLiveComments] = useState<{ username: string; message: string }[]>([
    { username: 'Joseph', message: 'Amazing live stream! 🔥' },
    { username: 'Mary', message: 'Hello from Nairobi! ❤️' }
  ]);
  const [liveLikes, setLiveLikes] = useState<number>(342);

  // Story Image state
  const [storyImage, setStoryImage] = useState<string | null>(null);

  // Low Data Mode state
  const [lowDataMode, setLowDataMode] = useState<boolean>(() => LowDataService.isEnabled());
  const handleToggleLowData = (value: boolean) => {
    setLowDataMode(value);
    LowDataService.setEnabled(value);
    showToast(value ? 'Low Data Mode enabled' : 'Low Data Mode disabled');
  };

  // Group creation state
  const [groupNameInput, setGroupNameInput] = useState<string>('');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  // Post follow states per post ID
  const [postFollows, setPostFollows] = useState<Record<string, boolean>>({});

  // Home Post Box state
  const [homePostText, setHomePostText] = useState<string>('');
  const [homePostPhoto, setHomePostPhoto] = useState<string | null>(null);

  // Gift Menu state
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);

  const handleHomePostSubmit = () => {
    if (!homePostText.trim() && !homePostPhoto) return;
    const newPost: PostItem = {
      id: Date.now().toString(),
      userId: 'bythex/sami',
      name: 'Sami',
      message: homePostText,
      likes: 0,
      isLiked: false,
      createdAt: 'Just now',
      image: homePostPhoto || undefined,
      views: 1,
      boosted: false
    };
    setPosts([newPost, ...posts]);
    setHomePostText('');
    setHomePostPhoto(null);
    showToast('Post created!');
  };

  // Video Feed state
  const [videoIndex, setVideoIndex] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<number, { count: number; liked: boolean; followed: boolean }>>({
    0: { count: 12000, liked: false, followed: false },
    1: { count: 8400, liked: false, followed: false },
    2: { count: 21500, liked: false, followed: false },
    3: { count: 5300, liked: false, followed: false },
  });

  // AI Studio state
  const [aiMode, setAiMode] = useState<'image' | 'text'>('image');
  const [imagePrompt, setImagePrompt] = useState<string>('Cinematic cyberpunk cityscape at night, neon reflections, 8k resolution');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [imageSize, setImageSize] = useState<string>('2K');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatedImageResult, setGeneratedImageResult] = useState<string | null>(null);

  const [textPrompt, setTextPrompt] = useState<string>('Write a welcoming post for new members joining Bythex.');
  const [textModel, setTextModel] = useState<string>('gemini-3.8-flash');
  const [isGeneratingText, setIsGeneratingText] = useState<boolean>(false);
  const [generatedTextResult, setGeneratedTextResult] = useState<string>('');

  const products = {
    'gift': {
      'amount': 100,
      'currency': 'KES',
      'title': 'Live Gifts',
      'subtitle': 'Buy gifts for creators',
      'icon': '🎁'
    },
    'boost': {
      'amount': 500,
      'currency': 'KES',
      'title': 'Boost Post',
      'subtitle': 'Get more views and followers',
      'icon': '🚀'
    },
    'verification': {
      'amount': 1500,
      'currency': 'KES',
      'title': 'Get Verified',
      'subtitle': 'Get the Bythex verification badge',
      'icon': '🔵'
    },
  };

  const buyProduct = async (product: string) => {
    setShowBundlesModal(false);
    setStripeProduct(product);
    setShowStripeModal(true);
  };

  const continuePayment = async () => {
    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      showToast('Please complete all card details');
      return;
    }
    setPaymentLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setShowStripeModal(false);
      if (stripeProduct === 'verification') {
        setIsVerified(true);
        showToast('Payment submitted. Your verification badge is now active 🔵');
      } else {
        showToast(`Purchased ${stripeProduct} successfully! (${products[stripeProduct as keyof typeof products]?.amount} KES)`);
      }
    } catch (e) {
      showToast(`Payment failed: ${e}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'create') {
      setShowUsernameStep(true);
      return;
    }

    if (suspendedUntil && Date.now() < suspendedUntil) {
      const hoursLeft = Math.ceil((suspendedUntil - Date.now()) / (1000 * 60 * 60));
      showToast(`Your account is temporarily suspended. Try again in ~${hoursLeft} hour(s). 🔒`);
      return;
    }

    if (authPassword === 'wrong' || authPassword === 'incorrect') {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      try { localStorage.setItem('bythex_failed_attempts', String(attempts)); } catch {}

      if (attempts >= 3) {
        const until = Date.now() + 12 * 60 * 60 * 1000;
        setSuspendedUntil(until);
        try { localStorage.setItem('bythex_suspended_until', String(until)); } catch {}
        showToast('Too many incorrect attempts. Your Bythex account is suspended for 12 hours.');
      } else {
        showToast(`Incorrect password. ${3 - attempts} attempt(s) remaining.`);
      }
      return;
    }

    // Success: reset failed attempts
    setFailedAttempts(0);
    setSuspendedUntil(null);
    try {
      localStorage.removeItem('bythex_failed_attempts');
      localStorage.removeItem('bythex_suspended_until');
    } catch {}
    setIsLoggedIn(true);
    showToast('Signed in successfully! 🚀');
  };

  const handleCheckUsername = (val: string) => {
    setUsernameInput(val);
    const clean = val.trim().toLowerCase();
    if (clean.length < 4) {
      setUsernameAvailable(false);
      return;
    }
    setCheckingUsername(true);
    setTimeout(() => {
      setCheckingUsername(false);
      setUsernameAvailable(true);
    }, 400);
  };

  const handleSaveUsername = () => {
    if (!usernameAvailable || usernameInput.trim().length < 4) return;
    setShowUsernameStep(false);
    setIsLoggedIn(true);
    showToast(`Username @${usernameInput.trim()} saved! Welcome to Bythex.`);
  };

  const handleLikePost = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleBoostSubmit = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          boosted: true,
          boostAmount: boostBudget,
          boostCurrency: 'USD',
          boostGoal: boostGoal,
          boostStatus: 'active',
          views: (p.views || 100) + 1250
        };
      }
      return p;
    }));
    setBoostingPostId(null);
    showToast('Post boosted successfully! 🚀');
  };

  const handlePublishMusicPost = () => {
    if (!musicCaption.trim() && !selectedSong) return;
    const newPost: PostItem = {
      id: Date.now().toString(),
      userId: 'abc123',
      name: 'Bythex User',
      message: musicCaption,
      likes: 0,
      isLiked: false,
      createdAt: 'Just now',
      song: selectedSong || undefined,
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
      views: 10,
      boosted: false
    };
    setPosts([newPost, ...posts]);
    setMusicCaption('');
    setSelectedSong(null);
    setActiveTab('home');
    showToast('Music post published successfully!');
  };

  const handleSendCommentWithPhoto = () => {
    if (!commentInput.trim() && !selectedCommentPhoto) return;
    const newComment = {
      id: Date.now().toString(),
      username: 'You',
      text: commentInput,
      likes: 0,
      photo: selectedCommentPhoto || undefined,
      parentIndex: replyingTo !== null ? replyingTo : null
    };
    setCommentsList([...commentsList, newComment]);
    setCommentInput('');
    setSelectedCommentPhoto(null);
    setReplyingTo(null);
    setReplyingToUsername(null);
  };

  const handleSendLiveComment = () => {
    if (!liveCommentInput.trim()) return;
    setLiveComments([...liveComments, { username: 'Bythex User', message: liveCommentInput }]);
    setLiveCommentInput('');
  };

  const handleDownloadImage = () => {
    if (!generatedImageResult) return;
    const link = document.createElement('a');
    link.href = generatedImageResult;
    link.download = `bythex-ai-artwork-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Image downloaded successfully!');
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio, imageSize })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image');
      setGeneratedImageResult(data.imageUrl);
      showToast('AI Image generated!');
    } catch (err: any) {
      showToast(err.message || 'Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateText = async () => {
    if (!textPrompt.trim()) return;
    setIsGeneratingText(true);
    try {
      const res = await fetch('/api/gemini/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textPrompt, modelChoice: textModel })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate text');
      setGeneratedTextResult(data.text);
    } catch (err: any) {
      showToast(err.message || 'Text generation failed');
    } finally {
      setIsGeneratingText(false);
    }
  };

  // Splash Screen View (App Opening Logo matching user upload)
  if (showSplash) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#070913] text-white flex flex-col items-center justify-center p-6 selection:bg-blue-600 selection:text-white">
        {/* Glowing Background Ambiance */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-purple-600/20 blur-[90px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col items-center space-y-6 text-center animate-fadeIn">
          {/* 3D Liquid B Logo with Play Button Cutout */}
          <div className="relative w-28 h-28 rounded-[32px] bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-[2px] shadow-2xl shadow-blue-500/30 group">
            <div className="w-full h-full bg-[#0b0f19] rounded-[30px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-purple-600/30 to-cyan-400/20 opacity-80" />
              {/* Play / B Icon Graphic */}
              <div className="relative z-10 text-white flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50 transform group-hover:scale-105 transition-transform">
                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-4xl font-extrabold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
              BYTHEX
            </h1>
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
              Connect. Share. Discover.
            </p>
          </div>

          <div className="pt-6 space-y-4 flex flex-col items-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="text-xs text-slate-400 tracking-[0.15em] font-medium">
              Loading Bythex...
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 text-[11px] text-slate-500 font-medium tracking-wider">
          Powered by Samiel
        </div>
      </div>
    );
  }

  // Login Screen with Liquid Gradient and Floating Circles & Username Step
  if (!isLoggedIn) {
    if (showUsernameStep) {
      return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#1515FF] via-[#7B2CFF] to-[#00C6FF] flex items-center justify-center p-6 selection:bg-blue-600 selection:text-white">
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full bg-white/10 blur-2xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-[340px] h-[340px] rounded-full bg-white/10 blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />

          <div className="relative z-10 w-full max-w-md bg-white/92 backdrop-blur-2xl rounded-[30px] p-8 shadow-2xl border border-white/20 text-slate-900 animate-fadeIn space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
                Choose your Bythex username
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                This is how people will find you on Bythex.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">@</span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => handleCheckUsername(e.target.value)}
                    className="w-full pl-9 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition-all font-medium"
                    placeholder="samiel"
                    required
                  />
                  <div className="absolute right-4 top-3.5 flex items-center">
                    {checkingUsername ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : usernameAvailable && usernameInput.trim().length >= 4 ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : null}
                  </div>
                </div>
              </div>

              {usernameAvailable && usernameInput.trim().length >= 4 && (
                <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Username is available</span>
                </div>
              )}

              <button
                type="button"
                disabled={!usernameAvailable || usernameInput.trim().length < 4}
                onClick={handleSaveUsername}
                className={`w-full py-3.5 px-4 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  usernameAvailable && usernameInput.trim().length >= 4
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#1515FF] via-[#7B2CFF] to-[#00C6FF] flex items-center justify-center p-6 selection:bg-blue-600 selection:text-white">
        {/* Animated Liquid Circles */}
        <div className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full bg-white/10 blur-2xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-[340px] h-[340px] rounded-full bg-white/10 blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />

        <div className="relative z-10 w-full max-w-md bg-white/92 backdrop-blur-2xl rounded-[30px] p-8 shadow-2xl border border-white/20 text-slate-900 animate-fadeIn">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold tracking-widest text-slate-900 mb-1">
              BYTHEX
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Connect. Share. Discover.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('create')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'create' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === 'create' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">First name</label>
                  <input
                    type="text"
                    value={firstNameInput}
                    onChange={(e) => setFirstNameInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition-all font-medium"
                    placeholder="Samiel"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Second name</label>
                  <input
                    type="text"
                    value={secondNameInput}
                    onChange={(e) => setSecondNameInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition-all font-medium"
                    placeholder="Developer"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone number</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition-all font-medium"
                  placeholder="07XXXXXXXX"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{authMode === 'create' ? 'CREATE ACCOUNT' : 'LOGIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'create' : 'login')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                {authMode === 'login' ? 'Create a new account' : 'Already have an account? Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0 selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Gift Menu Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Send a Gift</span>
                <span>🎁</span>
              </h3>
              <button onClick={() => setShowGiftModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              {[
                { name: '❤️ Love', price: 1 },
                { name: '🌹 Rose', price: 2 },
                { name: '💎 Diamond', price: 5 },
                { name: '👑 Crown', price: 10 },
              ].map((gift) => (
                <div key={gift.name} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gift.name.split(' ')[0]}</span>
                    <div>
                      <div className="font-bold text-sm text-white">{gift.name}</div>
                      <div className="text-xs text-slate-400">${gift.price} USD</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowGiftModal(false);
                      setSelectedGiftForPayment(gift);
                      setShowGiftPaymentModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Send & Pay
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gift Payment & Bank Tie Modal */}
      {showGiftPaymentModal && selectedGiftForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fadeIn text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <span>Bank Tie & Payment for {selectedGiftForPayment.name}</span>
              </h3>
              <button onClick={() => { setShowGiftPaymentModal(false); setSelectedGiftForPayment(null); }} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Gift Item & Value</div>
                <div className="text-sm font-bold">{selectedGiftForPayment.name} (${selectedGiftForPayment.price} USD)</div>
              </div>
              <div className="text-emerald-400 font-bold text-xs">KSh {selectedGiftForPayment.price * 130}</div>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-300">Choose Payment Method / Bank Tie</div>

              {/* M-Pesa Option */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">M</div>
                    <div>
                      <div className="font-bold text-xs">M-Pesa (Direct to Merchant)</div>
                      <div className="text-[10px] text-slate-400">Flows instantly to account</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">KSh {selectedGiftForPayment.price * 130}</span>
                </div>
                <div className="text-[10px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 font-mono flex items-center justify-between">
                  <span>Merchant M-Pesa Number:</span>
                  <span className="font-bold">0141422771</span>
                </div>
                <input
                  type="text"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="2547XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={async () => {
                    if (!mpesaPhone.trim()) {
                      showToast('Enter M-Pesa phone number');
                      return;
                    }
                    setMpesaLoading(true);
                    showToast('Sending M-Pesa STK push for gift to 0141422771...');
                    await new Promise(r => setTimeout(r, 1500));
                    setMpesaLoading(false);

                    const newGiftEntry = {
                      name: selectedGiftForPayment.name,
                      price: selectedGiftForPayment.price,
                      sender: 'You',
                      time: 'Just now',
                      method: 'M-Pesa (0141422771)'
                    };
                    setReceivedGifts([newGiftEntry, ...receivedGifts]);
                    setShowGiftPaymentModal(false);
                    setSelectedGiftForPayment(null);
                    showToast(`Gift ${selectedGiftForPayment.name} sent via M-Pesa! Displayed in Dashboard 🎁`);
                  }}
                  disabled={mpesaLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {mpesaLoading ? 'Processing STK Push...' : `Pay KSh ${selectedGiftForPayment.price * 130} via M-Pesa (0141422771)`}
                </button>
              </div>

              {/* Bank Tie / Card Option */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Bank Account Tie / Card</div>
                      <div className="text-[10px] text-slate-400">Direct bank transfer / Visa</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-400">${selectedGiftForPayment.price} USD</span>
                </div>
                <div className="text-[10px] text-blue-400 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 font-mono flex items-center justify-between">
                  <span>Linked Bank Account:</span>
                  <span className="font-bold">Equity Bank •••• 4242</span>
                </div>
                <button
                  onClick={async () => {
                    setPaymentLoading(true);
                    showToast('Processing bank account tie transfer...');
                    await new Promise(r => setTimeout(r, 1500));
                    setPaymentLoading(false);

                    const newGiftEntry = {
                      name: selectedGiftForPayment.name,
                      price: selectedGiftForPayment.price,
                      sender: 'You',
                      time: 'Just now',
                      method: 'Bank Account (0141422771 Tie)'
                    };
                    setReceivedGifts([newGiftEntry, ...receivedGifts]);
                    setShowGiftPaymentModal(false);
                    setSelectedGiftForPayment(null);
                    showToast(`Gift ${selectedGiftForPayment.name} sent via Bank Tie! Displayed in Dashboard 🎁`);
                  }}
                  disabled={paymentLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {paymentLoading ? 'Processing Bank Tie...' : `Pay $${selectedGiftForPayment.price} via Bank Account Tie`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bio Modal */}
      {isEditingBio && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Bio</h3>
              <button onClick={() => setIsEditingBio(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <textarea
              rows={4}
              maxLength={150}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Tell people about yourself..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingBio(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUserBio(bioInput);
                  setIsEditingBio(false);
                  showToast('Bio updated successfully!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boost Modal */}
      {boostingPostId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fadeIn text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>{showBoostPayment ? 'Boost Payment Options' : 'Boost Post'}</span>
              </h3>
              <button onClick={() => { setBoostingPostId(null); setShowBoostPayment(false); }} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            {!showBoostPayment ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Boost Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['followers', 'engagement'].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setBoostGoal(goal)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize cursor-pointer ${
                          boostGoal === goal ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Budget (USD)</label>
                  <div className="flex gap-2">
                    {[2, 4, 10, 25].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setBoostBudget(amt)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
                          boostBudget === amt ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowBoostPayment(true)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Continue to Payment (${boostBudget} USD)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Boost Package</div>
                    <div className="text-sm font-bold capitalize">{boostGoal} • ${boostBudget} USD</div>
                  </div>
                  <button onClick={() => setShowBoostPayment(false)} className="text-xs text-blue-400 hover:underline cursor-pointer">Change</button>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-300">Choose Payment Method</div>

                  {/* M-Pesa Option */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">M</div>
                        <div>
                          <div className="font-bold text-xs">M-Pesa STK Push</div>
                          <div className="text-[10px] text-slate-400">Instant mobile money</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">KSh {boostBudget * 130}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 font-mono flex items-center justify-between">
                      <span>Merchant M-Pesa:</span>
                      <span className="font-bold">0141422771</span>
                    </div>
                    <input
                      type="text"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="2547XXXXXXXX"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      onClick={async () => {
                        if (!mpesaPhone.trim()) {
                          showToast('Enter M-Pesa phone number');
                          return;
                        }
                        setMpesaLoading(true);
                        showToast('Sending M-Pesa STK push for boost...');
                        await new Promise(r => setTimeout(r, 1500));
                        setMpesaLoading(false);
                        handleBoostSubmit(boostingPostId);
                        setShowBoostPayment(false);
                        showToast('M-Pesa payment confirmed! Post boosted successfully 🚀');
                      }}
                      disabled={mpesaLoading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {mpesaLoading ? 'Processing STK Push...' : `Pay KSh ${boostBudget * 130} via M-Pesa`}
                    </button>
                  </div>

                  {/* Bank / Card Option */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs">Credit / Debit Card</div>
                          <div className="text-[10px] text-slate-400">Visa, Mastercard via Stripe</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-400">${boostBudget} USD</span>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                      <span>Card ending in {savedCard?.last4 || '4242'}</span>
                      <span className="text-emerald-400 text-[10px]">Saved</span>
                    </div>
                    <button
                      onClick={async () => {
                        setPaymentLoading(true);
                        showToast('Processing secure card payment...');
                        await new Promise(r => setTimeout(r, 1500));
                        setPaymentLoading(false);
                        handleBoostSubmit(boostingPostId);
                        setShowBoostPayment(false);
                        showToast('Card payment successful! Post boosted successfully 🚀');
                      }}
                      disabled={paymentLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {paymentLoading ? 'Processing Card...' : `Pay $${boostBudget} USD with Card`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bundles Modal Bottom Sheet */}
      {showBundlesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Bythex Store & Bundles</h3>
              <button onClick={() => setShowBundlesModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Creator Products</div>
              {Object.entries(products).map(([key, prod]) => (
                <div key={key} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{prod.icon}</span>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{prod.title}</span>
                        {key === 'verification' && isVerified && (
                          <Verified className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{prod.subtitle}</div>
                      <div className="text-[11px] font-semibold text-blue-400 mt-0.5">KSh {prod.amount}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => buyProduct(key)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Buy
                  </button>
                </div>
              ))}

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-3 mb-1">Data Bundles</div>
              {[
                { bundle: '100 MB', price: 'KSh 10' },
                { bundle: '500 MB', price: 'KSh 50' },
                { bundle: '1 GB', price: 'KSh 100' },
              ].map((item) => (
                <div key={item.bundle} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-bold text-sm text-white">{item.bundle}</div>
                      <div className="text-xs text-slate-400">{item.price}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowBundlesModal(false);
                      showToast(`Selected ${item.bundle} for ${item.price}`);
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    BUY
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stripe Add Card / Payment Modal (AddCardPage & Stripe Payment Sheet) */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 animate-fadeIn text-white max-h-[90vh] overflow-y-auto">
            {/* AppBar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold">Add Card</h3>
              <button onClick={() => setShowStripeModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            {/* Page Header */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                <CreditCard className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-2xl font-bold tracking-tight text-white">Enter card details</h4>
              <p className="text-sm text-slate-400">Secure card setup for Bythex payments</p>
            </div>

            {/* Card Form matching CardFormStyle (borderRadius 10, borderWidth 1, borderColor grey) */}
            <div className="space-y-4 bg-slate-100 p-4 rounded-[10px] border border-slate-300 text-slate-900">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-[10px] text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Expires</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-[10px] text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-[10px] text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="CVC"
                  />
                </div>
              </div>
            </div>

            {/* Secure Notice */}
            <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[13px] text-slate-300 leading-relaxed">
                Your card details are handled securely. Bythex does not store your full card number or CVC.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={async () => {
                if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
                  showToast('Please enter complete card details');
                  return;
                }
                setPaymentLoading(true);
                try {
                  await new Promise((r) => setTimeout(r, 1200));
                  const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '4242';
                  setSavedCard({ last4, expiry: cardExpiry });
                  setShowStripeModal(false);
                  showToast('Card submitted securely & saved successfully! 💳');
                } catch (e) {
                  showToast(`Card setup failed: ${e}`);
                } finally {
                  setPaymentLoading(false);
                }
              }}
              disabled={paymentLoading}
              className="w-full h-[52px] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {paymentLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Save Card</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setShowStripeModal(false);
                  setShowMpesaModal(true);
                }}
                className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Or pay with M-PESA (KSh 1,500)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M-PESA Verification Modal (MpesaVerificationPage) */}
      {showMpesaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 animate-fadeIn text-white max-h-[90vh] overflow-y-auto">
            {/* AppBar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold">M-PESA Verification</h3>
              <button onClick={() => setShowMpesaModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            {/* Page Header */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                <Verified className="w-10 h-10 fill-blue-500/20 text-blue-500" />
              </div>
              <h4 className="text-2xl font-bold tracking-tight text-white">Get Bythex Verified 🔵</h4>
              <p className="text-base text-slate-300">Verification fee: KSh 1,500</p>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">M-PESA phone number</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400">
                  <Smartphone className="w-5 h-5" />
                </span>
                <input
                  type="tel"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="2547XXXXXXXX"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={payWithMpesa}
              disabled={mpesaLoading}
              className="w-full h-[55px] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {mpesaLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending M-PESA prompt...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  <span>Pay KSh 1,500 with M-PESA</span>
                </>
              )}
            </button>

            <div className="text-center">
              <button
                onClick={() => {
                  setShowMpesaModal(false);
                  setShowStripeModal(true);
                }}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Back to Card Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password / OTP Reset Modal (ForgotPasswordPage & OtpPage & NewPasswordPage) */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 animate-fadeIn text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold">Forgot Password</h3>
              <button onClick={() => setShowForgotPasswordModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                <Lock className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="text-2xl font-bold tracking-tight text-white">Reset your password</h4>
              <p className="text-sm text-slate-300">Enter your phone number and we will send you a verification code.</p>
            </div>

            {!otpCodeSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400">
                      <Smartphone className="w-5 h-5" />
                    </span>
                    <input
                      type="tel"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="07XXXXXXXX"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!forgotPhone.trim()) {
                      showToast('Enter your phone number');
                      return;
                    }
                    setOtpCodeSent(true);
                    showToast('OTP sent to your phone');
                  }}
                  className="w-full h-[52px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>SEND OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 text-center">Enter the 6-digit code sent to {forgotPhone}.</p>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">OTP code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-lg text-white text-center font-mono focus:outline-none focus:border-blue-500 tracking-widest"
                    placeholder="123456"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New password</label>
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  onClick={() => {
                    if (otpInput.length < 6) {
                      showToast('Enter the 6-digit OTP');
                      return;
                    }
                    if (newPasswordInput.length < 6) {
                      showToast('Password must contain at least 6 characters');
                      return;
                    }
                    setShowForgotPasswordModal(false);
                    setOtpCodeSent(false);
                    setOtpInput('');
                    setNewPasswordInput('');
                    showToast('Password changed successfully!');
                  }}
                  className="w-full h-[52px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>VERIFY & CHANGE PASSWORD</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AppBar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {activeTab !== 'home' && (
            <button onClick={() => setActiveTab('home')} className="text-slate-400 hover:text-white mr-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <CircularBythexBrand size={40} />
            <span className="text-sm font-extrabold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-300 hidden sm:inline">
              BYTHEX
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBundlesModal(true)}
            className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-600/30 transition-colors cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Bundles</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className="px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-600/30 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              5
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Interactive Stories Bar */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {stories.map((story, index) => (
                <div
                  key={story.name}
                  onClick={() => {
                    if (index === 0) setActiveTab('story');
                    else setSelectedStoryViewer(story);
                  }}
                  className="flex flex-col items-center shrink-0 cursor-pointer"
                >
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500">
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-slate-900 flex flex-col items-center justify-center text-slate-300 relative overflow-hidden">
                      <UserIcon className="w-6 h-6" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center py-0.5">
                        👁 {story.views}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1 truncate w-16 text-center">{story.name}</span>
                  <div className="flex gap-1 text-[9px] text-slate-400 mt-0.5">
                    <span>❤️ {story.likes}</span>
                    <span>😢 {story.cries}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Home Post Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                  S
                </div>
                <textarea
                  rows={2}
                  value={homePostText}
                  onChange={(e) => setHomePostText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {homePostPhoto && (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 h-48 bg-slate-950">
                  <img src={homePostPhoto} alt="Selected photo" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setHomePostPhoto(null)}
                    className="absolute top-2 right-2 p-1 bg-black/70 text-white rounded-full hover:bg-black"
                  >
                    ✕
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                id="home-post-file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const compressed = await compressImageToLowData(file);
                    setHomePostPhoto(compressed);
                    showToast('Photo compressed (~0.02MB) & attached!');
                  }
                }}
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => document.getElementById('home-post-file')?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Photo</span>
                </button>

                <button
                  onClick={handleHomePostSubmit}
                  disabled={!homePostText.trim() && !homePostPhoto}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Latest Posts</h2>
                <button
                  onClick={() => setActiveTab('music-post')}
                  className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Music className="w-3 h-3" />
                  <span>+ Music Post</span>
                </button>
              </div>
              <button
                onClick={() => setActiveTab('live')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5 animate-pulse" />
                <span>GO LIVE</span>
              </button>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div 
                      onClick={() => setViewingUserProfile({ name: post.name, isVerified: post.name === 'Bythex User' && isVerified, bio: 'Creator and active member on Bythex.' })}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold group-hover:bg-blue-600/30 transition-colors">
                        {post.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-white group-hover:underline">{post.name}</span>
                          {(post.name === 'Bythex User' && isVerified) && (
                            <Verified className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">2h ago</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const current = postFollows[post.id] || false;
                          setPostFollows({ ...postFollows, [post.id]: !current });
                          showToast(current ? `Unfollowed ${post.name}` : `Following ${post.name}`);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          postFollows[post.id] ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-transparent text-white border-white/40 hover:bg-slate-800'
                        }`}
                      >
                        {postFollows[post.id] ? 'Following' : 'Follow'}
                      </button>

                      {post.boosted ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-semibold text-amber-400">
                          <Zap className="w-3.5 h-3.5 fill-amber-400" />
                          <span>Boosted</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setBoostingPostId(post.id)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Boost</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-200">{post.message}</p>

                  {post.song && (
                    <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-white">{post.song}</div>
                        <div className="text-[10px] text-slate-400">Playing background audio</div>
                      </div>
                      <Play className="w-4 h-4 text-blue-400" />
                    </div>
                  )}

                  {post.image && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={post.image} alt="Post media" referrerPolicy="no-referrer" className="w-full max-h-80 object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-2 border-t border-slate-800/60 text-slate-400">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                        post.isLiked ? 'text-red-500 font-semibold' : 'hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button onClick={() => setActiveTab('comments')} className="flex items-center gap-1.5 text-xs hover:text-white cursor-pointer">
                      <MessageSquare className="w-4 h-4" />
                      <span>Comments ({commentsList.length})</span>
                    </button>
                    <button onClick={() => showToast('Link copied!')} className="flex items-center gap-1.5 text-xs hover:text-white cursor-pointer ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4 animate-fadeIn flex flex-col h-[75vh]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('videos')}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white cursor-pointer"
                title="Back to Videos"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-white">Comments</h1>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {commentsList.map((c, i) => {
                const isReply = c.parentIndex !== null && c.parentIndex !== undefined;
                return (
                  <div
                    key={c.id || i}
                    className={`p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 ${isReply ? 'ml-6 border-l-2 border-blue-500/50 pl-4' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {c.username[0] || 'B'}
                      </div>
                      <span className="font-bold text-xs text-white">{c.username}</span>
                      {isReply && <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Reply</span>}
                    </div>
                    {c.text && <div className="text-xs text-slate-200">{c.text}</div>}
                    {c.photo && (
                      <div className="rounded-lg overflow-hidden border border-slate-800 w-36 h-36">
                        <img src={c.photo} alt="Comment attachment" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-1 text-slate-400 text-xs">
                      <button
                        onClick={() => {
                          const updated = [...commentsList];
                          updated[i].likes++;
                          setCommentsList(updated);
                        }}
                        className="flex items-center gap-1 hover:text-red-400 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{c.likes}</span>
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(i);
                          setReplyingToUsername(c.username);
                        }}
                        className="hover:text-white cursor-pointer font-semibold text-blue-400"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCommentPhoto && (
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={selectedCommentPhoto} alt="Selected" className="w-12 h-12 rounded-lg object-cover" />
                  <span className="text-xs text-slate-300">Photo attached</span>
                </div>
                <button onClick={() => setSelectedCommentPhoto(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {replyingTo !== null && (
              <div className="p-2.5 bg-blue-600/10 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
                <span className="text-blue-300 font-medium">Replying to @{replyingToUsername}</span>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyingToUsername(null);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedCommentPhoto('https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80')}
                className="p-2.5 bg-slate-800 text-blue-400 rounded-full hover:bg-slate-700 cursor-pointer"
                title="Attach Photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCommentWithPhoto()}
                placeholder={replyingTo === null ? "Write a comment..." : `Replying to @${replyingToUsername}...`}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendCommentWithPhoto}
                className="p-2.5 bg-blue-600 text-white rounded-full cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'music-post' && (
          <div className="space-y-6 animate-fadeIn max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-white text-center">Create Music Post</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="h-48 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500">
                <ImageIcon className="w-10 h-10 mb-2 text-blue-500" />
                <span className="text-xs">Add Cover Photo / Video</span>
              </div>

              <textarea
                rows={3}
                value={musicCaption}
                onChange={(e) => setMusicCaption(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Write something about your music..."
              />

              <div
                onClick={() => setShowSongPicker(true)}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-semibold text-white">{selectedSong || 'Add Music'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>

              {showSongPicker && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Select Soundtrack</div>
                  {songsList.map((song) => (
                    <div
                      key={song}
                      onClick={() => {
                        setSelectedSong(song);
                        setShowSongPicker(false);
                      }}
                      className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs text-white cursor-pointer flex items-center justify-between"
                    >
                      <span>{song}</span>
                      <Play className="w-3 h-3 text-blue-400" />
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handlePublishMusicPost}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                POST
              </button>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-6 animate-fadeIn max-w-md mx-auto text-center pt-6 pb-12">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto border border-blue-500/30">
              <Verified className="w-10 h-10 text-blue-500 fill-blue-500/20" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Get the Bythex Verified Badge</h1>
              <p className="text-xs text-slate-400 mt-1.5">Verify your account, gain credibility, and unlock creator privileges.</p>
            </div>
            <div className="text-3xl font-extrabold text-white">KSh 1,500 <span className="text-xs font-normal text-slate-400">(~$11)</span></div>

            <div className="space-y-3 pt-2 text-left">
              <div className="text-xs font-semibold text-slate-300">Choose Payment Method</div>
              
              {/* M-Pesa Option */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">M</div>
                    <div>
                      <div className="font-bold text-sm text-white">M-Pesa STK Push</div>
                      <div className="text-[11px] text-slate-400">Instant mobile money payment</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">KSh 1,500</span>
                </div>
                <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-mono flex items-center justify-between">
                  <span>Merchant M-Pesa:</span>
                  <span className="font-bold">0141422771</span>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Your M-Pesa Phone Number</label>
                  <input
                    type="text"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="2547XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!mpesaPhone.trim()) {
                      showToast('Please enter your M-Pesa phone number');
                      return;
                    }
                    setMpesaLoading(true);
                    showToast('Sending M-Pesa STK push to ' + mpesaPhone + '...');
                    await new Promise(r => setTimeout(r, 1500));
                    setMpesaLoading(false);
                    setIsVerified(true);
                    showToast('M-Pesa payment confirmed! You are now verified 🔵');
                    setActiveTab('profile');
                  }}
                  disabled={mpesaLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {mpesaLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing M-Pesa...</span>
                    </>
                  ) : (
                    <span>Pay with M-Pesa (KSh 1,500)</span>
                  )}
                </button>
              </div>

              {/* Card / Stripe Option */}
              <div 
                onClick={() => {
                  setStripeProduct('verification');
                  setShowStripeModal(true);
                }}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Credit / Debit Card</div>
                    <div className="text-[11px] text-slate-400">Visa, Mastercard via Stripe</div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                  <span>Pay $11</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4 animate-fadeIn">
            {activeChatUser ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[75vh]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveChatUser(null)} className="text-slate-400 hover:text-white cursor-pointer mr-1">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
                      {activeChatUser[0]}
                    </div>
                    <span className="font-bold text-sm text-white">{activeChatUser}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveCall('video')}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Video call"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveCall('voice')}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Voice call"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setTargetPartnerForPin(activeChatUser);
                        if (chatPins[activeChatUser]) {
                          const nextPins = { ...chatPins };
                          delete nextPins[activeChatUser];
                          setChatPins(nextPins);
                          try { localStorage.setItem('bythex_chat_pins', JSON.stringify(nextPins)); } catch {}
                          showToast(`Chat lock removed for ${activeChatUser}`);
                        } else {
                          setIsSettingNewPin(true);
                          setChatPinInput('');
                          setShowChatPinModal(true);
                        }
                      }}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${chatPins[activeChatUser] ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                      title={chatPins[activeChatUser] ? 'Locked with PIN' : 'Lock chat with PIN'}
                    >
                      <Lock className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowEffectsSheet(true)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="More options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Offline Status & Simulator Banner */}
                <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`} />
                    <span>{isOnline ? 'Online (Auto-Sync Active)' : 'Offline Mode (Messages saving locally)'}</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !isOnline;
                      setIsOnline(next);
                      if (next) {
                        window.dispatchEvent(new Event('online'));
                      } else {
                        window.dispatchEvent(new Event('offline'));
                      }
                    }}
                    className="text-xs text-blue-400 hover:underline cursor-pointer font-semibold"
                  >
                    Simulate {isOnline ? 'Offline' : 'Online'}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {(chatMessages[activeChatUser] || []).map((msg, i) => (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[75%] p-3 rounded-2xl text-xs bg-blue-600 text-white rounded-br-none">
                        {msg.type === 'text' ? (
                          <p>{msg.text}</p>
                        ) : (
                          <div className="rounded-xl overflow-hidden w-48 h-48">
                            <img src={msg.file} alt="Chat attachment" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newMsg = { type: 'photo' as const, file: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80' };
                      handleSendMessage(newMsg);
                    }}
                    className="p-2.5 bg-slate-800 text-blue-400 rounded-full hover:bg-slate-700 cursor-pointer"
                    title="Pick Photo"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        handleSendMessage({ type: 'text', text: chatInput.trim() });
                        setChatInput('');
                      }
                    }}
                    placeholder={isOnline ? "Write a message..." : "Write a message (Saved offline)..."}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-full text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (!chatInput.trim()) return;
                      handleSendMessage({ type: 'text', text: chatInput.trim() });
                      setChatInput('');
                    }}
                    className="p-2.5 bg-blue-600 text-white rounded-full cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-white">Messages</h1>
                <div className="space-y-2">
                  {['Joseph', 'Mary', 'Peter'].map((name) => {
                    const isLocked = chatPins[name];
                    const isUnlocked = unlockedChats[name];
                    return (
                      <div
                        key={name}
                        onClick={() => {
                          if (isLocked && !isUnlocked) {
                            setTargetPartnerForPin(name);
                            setIsSettingNewPin(false);
                            setChatPinInput('');
                            setShowChatPinModal(true);
                          } else {
                            setActiveChatUser(name);
                          }
                        }}
                        className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                            {name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                              <span>{name}</span>
                              {isLocked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <div className="text-xs text-slate-400">{isLocked && !isUnlocked ? 'Locked chat (Tap to enter PIN)' : 'Tap to chat'}</div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">Active</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Search Users</h1>
              <p className="text-xs text-slate-400">Discover creators, friends, and community members on Bythex.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, handle, or bio..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                {searchQuery.trim() ? `Search Results (${
                  [
                    { name: 'Joseph', handle: 'joseph_creator', bio: 'Creator and active member on Bythex.', isVerified: true, followers: '14.2K' },
                    { name: 'Mary', handle: 'mary_style', bio: 'Fashion, lifestyle & daily updates.', isVerified: true, followers: '8.5K' },
                    { name: 'Peter', handle: 'peter_dev', bio: 'Software engineer building cool web apps.', isVerified: false, followers: '3.1K' },
                    { name: 'Sarah Jenkins', handle: 'sarah_j', bio: 'Photographer & traveler capturing moments.', isVerified: true, followers: '24.9K' },
                    { name: 'David Kim', handle: 'david_kim', bio: 'Tech enthusiast & crypto explorer.', isVerified: false, followers: '920' },
                    { name: 'Alex Rivera', handle: 'alex_r', bio: 'Music producer and beatmaker.', isVerified: true, followers: '11.4K' },
                    { name: 'Emily Watson', handle: 'emily_w', bio: 'Fitness coach & healthy recipes.', isVerified: false, followers: '5.6K' },
                    { name: usernameInput.trim() || 'samiel', handle: usernameInput.trim() || 'samiel', bio: userBio, isVerified: isVerified, followers: '1.4K' }
                  ].filter(u => 
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.bio.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length
                })` : 'Suggested Creators'}
              </div>

              {[
                { name: 'Joseph', handle: 'joseph_creator', bio: 'Creator and active member on Bythex.', isVerified: true, followers: '14.2K' },
                { name: 'Mary', handle: 'mary_style', bio: 'Fashion, lifestyle & daily updates.', isVerified: true, followers: '8.5K' },
                { name: 'Peter', handle: 'peter_dev', bio: 'Software engineer building cool web apps.', isVerified: false, followers: '3.1K' },
                { name: 'Sarah Jenkins', handle: 'sarah_j', bio: 'Photographer & traveler capturing moments.', isVerified: true, followers: '24.9K' },
                { name: 'David Kim', handle: 'david_kim', bio: 'Tech enthusiast & crypto explorer.', isVerified: false, followers: '920' },
                { name: 'Alex Rivera', handle: 'alex_r', bio: 'Music producer and beatmaker.', isVerified: true, followers: '11.4K' },
                { name: 'Emily Watson', handle: 'emily_w', bio: 'Fitness coach & healthy recipes.', isVerified: false, followers: '5.6K' },
                { name: usernameInput.trim() || 'samiel', handle: usernameInput.trim() || 'samiel', bio: userBio, isVerified: isVerified, followers: '1.4K' }
              ].filter(u => 
                !searchQuery.trim() || 
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.bio.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((user) => (
                <div 
                  key={user.handle}
                  onClick={() => setViewingUserProfile({ name: user.name, isVerified: user.isVerified, bio: user.bio })}
                  className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-lg group-hover:bg-blue-600/30 transition-colors">
                      {user.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white group-hover:underline">{user.name}</span>
                        {user.isVerified && (
                          <Verified className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                        )}
                      </div>
                      <div className="text-xs text-blue-400">@{user.handle} · <span className="text-slate-400">{user.followers} followers</span></div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">{user.bio}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Following @${user.handle}!`);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-md shadow-blue-600/20"
                    >
                      Follow
                    </button>
                  </div>
                </div>
              ))}

              {[
                { name: 'Joseph', handle: 'joseph_creator', bio: 'Creator and active member on Bythex.', isVerified: true, followers: '14.2K' },
                { name: 'Mary', handle: 'mary_style', bio: 'Fashion, lifestyle & daily updates.', isVerified: true, followers: '8.5K' },
                { name: 'Peter', handle: 'peter_dev', bio: 'Software engineer building cool web apps.', isVerified: false, followers: '3.1K' },
                { name: 'Sarah Jenkins', handle: 'sarah_j', bio: 'Photographer & traveler capturing moments.', isVerified: true, followers: '24.9K' },
                { name: 'David Kim', handle: 'david_kim', bio: 'Tech enthusiast & crypto explorer.', isVerified: false, followers: '920' },
                { name: 'Alex Rivera', handle: 'alex_r', bio: 'Music producer and beatmaker.', isVerified: true, followers: '11.4K' },
                { name: 'Emily Watson', handle: 'emily_w', bio: 'Fitness coach & healthy recipes.', isVerified: false, followers: '5.6K' },
                { name: usernameInput.trim() || 'samiel', handle: usernameInput.trim() || 'samiel', bio: userBio, isVerified: isVerified, followers: '1.4K' }
              ].filter(u => 
                !searchQuery.trim() || 
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.bio.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No users found matching "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div 
            className="relative h-[78vh] bg-black rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between animate-fadeIn select-none touch-none"
            onWheel={(e) => {
              if (e.deltaY > 20) {
                setVideoIndex(prev => Math.min(3, prev + 1));
              } else if (e.deltaY < -20) {
                setVideoIndex(prev => Math.max(0, prev - 1));
              }
            }}
            onTouchStart={(e) => {
              (e.currentTarget as any).touchStartY = e.touches[0].clientY;
            }}
            onTouchEnd={(e) => {
              const startY = (e.currentTarget as any).touchStartY || 0;
              const endY = e.changedTouches[0].clientY;
              const diff = startY - endY;
              if (diff > 30) {
                setVideoIndex(prev => Math.min(3, prev + 1));
              } else if (diff < -30) {
                setVideoIndex(prev => Math.max(0, prev - 1));
              }
            }}
          >
            {/* Background video simulation */}
            <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto animate-pulse">
                  <Video className="w-8 h-8" />
                </div>
                <div className="text-xl font-bold text-white">Video {videoIndex + 1}</div>
                <div className="text-xs text-slate-400">Immersive Vertical Reel</div>
              </div>
            </div>

            {/* Profile Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-600/30 border border-blue-500 text-blue-400 flex items-center justify-center font-bold">
                  S
                </div>
                <span className="font-bold text-sm text-white">@samiel</span>
                <button
                  onClick={() => {
                    const current = videoLikes[videoIndex] || { count: 12000, liked: false, followed: false };
                    setVideoLikes({
                      ...videoLikes,
                      [videoIndex]: { ...current, followed: !current.followed }
                    });
                    showToast(current.followed ? 'Unfollowed @samiel' : 'Following @samiel');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    videoLikes[videoIndex]?.followed ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-transparent text-white border-white/40'
                  }`}
                >
                  {videoLikes[videoIndex]?.followed ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>

            {/* Vertical Action Buttons (Right) */}
            <div className="absolute right-4 bottom-28 flex flex-col items-center gap-4 z-10">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => {
                    const current = videoLikes[videoIndex] || { count: 12000, liked: false, followed: false };
                    setVideoLikes({
                      ...videoLikes,
                      [videoIndex]: {
                        ...current,
                        liked: !current.liked,
                        count: current.liked ? current.count - 1 : current.count + 1
                      }
                    });
                  }}
                  className={`p-3 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                    videoLikes[videoIndex]?.liked ? 'bg-red-600 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${videoLikes[videoIndex]?.liked ? 'fill-white' : ''}`} />
                </button>
                <span className="text-xs font-semibold text-white mt-1">
                  {Math.floor((videoLikes[videoIndex]?.count || 12000) / 1000)}K
                </span>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => setActiveTab('comments')}
                  className="p-3 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60 cursor-pointer"
                >
                  <MessageSquare className="w-6 h-6" />
                </button>
                <span className="text-xs font-semibold text-white mt-1">850</span>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => showToast('Video link copied!')}
                  className="p-3 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60 cursor-pointer"
                >
                  <Share2 className="w-6 h-6" />
                </button>
                <span className="text-xs font-semibold text-white mt-1">Share</span>
              </div>
            </div>

            {/* Caption (Bottom) */}
            <div 
              onClick={() => {
                const names = ['samiel', 'Joseph', 'Mary', 'Peter'];
                const name = names[videoIndex] || 'samiel';
                setViewingUserProfile({ name, isVerified: true, bio: 'Bythex Video Creator & Producer' });
              }}
              className="absolute bottom-4 left-4 right-20 z-10 space-y-1 cursor-pointer group"
            >
              <div className="font-bold text-sm text-white group-hover:underline">
                @{videoIndex === 0 ? 'samiel' : (videoIndex === 1 ? 'joseph' : (videoIndex === 2 ? 'mary' : 'peter'))}
              </div>
              <div className="text-xs text-slate-200">Check out my new video 🔥</div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1">
                <Music className="w-3 h-3" />
                <span>Original sound</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn max-w-md mx-auto text-center pt-4">
            <div className="relative inline-block">
              <input
                type="file"
                accept="image/*"
                id="profile-picture-file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const compressed = await compressImageToLowData(file);
                    setProfileImage(compressed);
                    showToast('Profile picture compressed (~0.02MB) & updated!');
                  }
                }}
              />
              <div
                onClick={() => document.getElementById('profile-picture-file')?.click()}
                className="w-24 h-24 rounded-full bg-blue-600/25 border-2 border-blue-500 text-blue-400 flex items-center justify-center text-4xl font-bold mx-auto overflow-hidden cursor-pointer group relative shadow-xl shadow-blue-500/20"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold">
                  Browse...
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h1 className="text-2xl font-bold text-white">Sami</h1>
                {isVerified && <Verified className="w-5 h-5 text-blue-500 fill-blue-500/20" />}
              </div>
              <p className="text-xs text-blue-400 font-mono mt-1">bythex/sami · Active now</p>
              <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto italic">{userBio}</p>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  setBioInput(userBio);
                  setIsEditingBio(true);
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Bio</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin + '/bythex/sami');
                  showToast('App link copied: bythex/sami');
                }}
                className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:bg-blue-600/30"
              >
                <span>Copy Link</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-around bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div>
                <div className="font-bold text-lg text-white">125</div>
                <div className="text-xs text-slate-400">Posts</div>
              </div>
              <div>
                <div className="font-bold text-lg text-white">1.2K</div>
                <div className="text-xs text-slate-400">Followers</div>
              </div>
              <div>
                <div className="font-bold text-lg text-white">350</div>
                <div className="text-xs text-slate-400">Following</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('verification')}
                className="flex-1 py-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Verified className="w-4 h-4" />
                <span>Get Verified ($11)</span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart2 className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white">Professional Dashboard</h1>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                <Eye className="w-6 h-6 text-blue-400 mx-auto" />
                <div className="text-xl font-bold text-white">25.4K</div>
                <div className="text-xs text-slate-400">Views</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                <Users className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-xl font-bold text-white">1.2K</div>
                <div className="text-xs text-slate-400">Followers</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                <Heart className="w-6 h-6 text-red-400 mx-auto" />
                <div className="text-xl font-bold text-white">8.7K</div>
                <div className="text-xs text-slate-400">Likes</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                <Gift className="w-6 h-6 text-amber-400 mx-auto" />
                <div className="text-xl font-bold text-white">{450 + receivedGifts.length}</div>
                <div className="text-xs text-slate-400">Gifts Received</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Estimated Earnings (Flows to 0141422771 / Bank Tie)</div>
                <div className="text-xl font-bold text-white mt-0.5">
                  KSh {(12500 + receivedGifts.reduce((acc, g) => acc + g.price * 130, 0)).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => showToast('Withdrawal initiated via M-Pesa to 0141422771')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Withdraw
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Live Stream Gifts & Bank Tie Ledger</span>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono">0141422771</span>
              </h3>
              <div className="space-y-2">
                {receivedGifts.map((gift, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{gift.name.split(' ')[0]}</span>
                      <div>
                        <div className="font-bold text-xs text-white">{gift.name} from {gift.sender}</div>
                        <div className="text-[10px] text-slate-400">{gift.method} • {gift.time}</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      +KSh {gift.price * 130}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white">Payment Methods</h1>

            <div
              onClick={() => showToast('M-Pesa configuration open')}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="font-bold text-sm text-white">M-Pesa</div>
                  <div className="text-xs text-slate-400">Manage M-Pesa number</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </div>

            <div
              onClick={() => setShowStripeModal(true)}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="font-bold text-sm text-white">Bank Card</div>
                  <div className="text-xs text-slate-400">
                    {savedCard ? `Saved: •••• ${savedCard.last4} (${savedCard.expiry})` : 'Add debit or credit card'}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-2 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
            {[
              { label: 'Account', icon: UserIcon, tab: 'profile' },
              { label: 'Switch Account', icon: Users, tab: 'accounts' },
              { label: 'Message Settings', icon: MessageSquare, tab: 'message-settings' },
              { label: 'Drafts', icon: Edit3, tab: 'drafts' },
              { label: 'Get Verified ($11)', icon: Verified, tab: 'verification' },
              { label: 'Payment Methods', icon: CreditCard, tab: 'payment' },
              { label: 'Professional Dashboard', icon: BarChart2, tab: 'dashboard' },
              { label: 'Blocked Users', icon: Shield, tab: 'blocked' },
              { label: 'Camera & Microphone Permissions', icon: Camera, tab: 'camera-permission' },
              { label: 'Dark Mode', icon: Moon, toggle: true },
              { label: `Language (${currentLanguage})`, icon: Globe, tab: 'language' },
              { label: 'Help & Support', icon: HelpCircle, tab: 'help' },
              { label: 'Log Out', icon: LogOut, action: () => setIsLoggedIn(false) },
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  if (item.toggle) {
                    const next = !isDarkMode;
                    setIsDarkMode(next);
                    showToast(next ? 'Dark Mode enabled 🌙' : 'Light Mode enabled ☀️');
                  } else if (item.tab) {
                    setActiveTab(item.tab);
                  }
                  if (item.action) item.action();
                }}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700"
              >
                <div className="flex items-center gap-3 text-slate-200">
                  <item.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.toggle && (
                    <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  )}
                  {!item.toggle && <ArrowRight className="w-4 h-4 text-slate-500" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'language' && (
          <div className="space-y-4 animate-fadeIn max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Select Language</h1>
              <button onClick={() => setActiveTab('settings')} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                Back to Settings
              </button>
            </div>
            <div className="space-y-2">
              {['English', 'Swahili (Kiswahili)', 'French', 'Spanish', 'Arabic', 'German', 'Portuguese'].map((lang) => (
                <div
                  key={lang}
                  onClick={() => {
                    setCurrentLanguage(lang);
                    setActiveTab('settings');
                    showToast(`Language changed to ${lang}`);
                  }}
                  className={`p-4 bg-slate-900 border rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                    currentLanguage === lang ? 'border-blue-500 bg-blue-600/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-semibold text-white">{lang}</span>
                  {currentLanguage === lang && <Check className="w-4 h-4 text-blue-400" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-6 animate-fadeIn max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Help & Support</h1>
              <button onClick={() => setActiveTab('settings')} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                Back to Settings
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</div>
              {[
                { q: 'How do I send live gifts & tie my bank?', a: 'Tap the Gift icon during a live stream, select your gift, and pay via M-Pesa merchant number 0141422771 or bank tie. Earnings appear in your Professional Dashboard.' },
                { q: 'How does offline messaging work?', a: 'When you are offline, outgoing messages are saved securely in local storage and automatically sent when your connection is restored.' },
                { q: 'How do I get the verified badge?', a: 'Go to Settings -> Get Verified ($11 / KSh 1,500) and complete payment via M-Pesa STK push or card.' },
                { q: 'How do I activate camera effects & filters?', a: 'During live streams or video calls, tap Effects to enable beauty mode, background blur, and color filters.' },
              ].map((faq, i) => (
                <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                  <div className="text-xs font-bold text-white">{faq.q}</div>
                  <div className="text-[11px] text-slate-300 leading-relaxed">{faq.a}</div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Contact Bythex Support</div>
              <textarea
                rows={3}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your issue or feedback..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
              />
              <button
                onClick={() => {
                  if (!supportMessage.trim()) {
                    showToast('Please enter your support message');
                    return;
                  }
                  setSupportMessage('');
                  showToast('Support request sent! We will get back to you shortly.');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                Send Support Request
              </button>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-4 animate-fadeIn max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Switch Account</h1>
              <button onClick={() => setActiveTab('settings')} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                Back to Settings
              </button>
            </div>

            <div className="space-y-2">
              {savedAccounts.map((acc) => (
                <div
                  key={acc.uid}
                  onClick={() => {
                    const updated = savedAccounts.map(a => ({ ...a, active: a.uid === acc.uid }));
                    setSavedAccounts(updated);
                    showToast(`Switched active session to ${acc.username}`);
                    setActiveTab('profile');
                  }}
                  className={`p-4 bg-slate-900 border rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                    acc.active ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-sm">
                      {acc.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{acc.name}</div>
                      <div className="text-xs text-slate-400">{acc.username}</div>
                    </div>
                  </div>
                  {acc.active && <Check className="w-5 h-5 text-emerald-400" />}
                </div>
              ))}

              <div
                onClick={() => {
                  setIsLoggedIn(false);
                  showToast('Sign in to add another Bythex account');
                }}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center gap-3 cursor-pointer mt-4"
              >
                <div className="w-11 h-11 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Add another account</div>
                  <div className="text-xs text-slate-400">Sign in to add another Bythex account</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drafts' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Drafts</h1>
              <button onClick={() => setActiveTab('settings')} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
                Back to Settings
              </button>
            </div>
            {drafts.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No drafts yet
              </div>
            ) : (
              <div className="space-y-3">
                {drafts.map((draft, index) => (
                  <div key={index} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{draft.caption}</div>
                        <div className="text-xs text-slate-400">{draft.type} draft</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setHomePostText(draft.caption);
                          setActiveTab('home');
                          showToast('Draft loaded into post creator!');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Continue
                      </button>
                      <button
                        onClick={() => {
                          const updated = drafts.filter((_, i) => i !== index);
                          setDrafts(updated);
                          showToast('Draft deleted');
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-xl cursor-pointer"
                        title="Delete draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'blocked' && (
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white">Blocked Users</h1>
            {blockedUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No blocked users</div>
            ) : (
              blockedUsers.map((user) => (
                <div key={user} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">{user[0]}</div>
                    <span className="text-sm font-semibold text-white">{user}</span>
                  </div>
                  <button
                    onClick={() => setBlockedUsers(blockedUsers.filter(u => u !== user))}
                    className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <button
                onClick={() => {
                  setNotificationsList(notificationsList.map(n => ({ ...n, read: true })));
                  showToast('All notifications marked as read');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Mark all as read
              </button>
            </div>
            <div className="space-y-2">
              {notificationsList.map((n, i) => (
                <div
                  key={n.id}
                  onClick={() => {
                    const updated = [...notificationsList];
                    updated[i].read = true;
                    setNotificationsList(updated);
                  }}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                    n.read ? 'bg-slate-900 border-slate-800' : 'bg-blue-600/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                      n.type === 'like' ? 'bg-red-600/20 text-red-400' :
                      n.type === 'comment' ? 'bg-blue-600/20 text-blue-400' :
                      n.type === 'gift' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : n.type === 'gift' ? '🎁' : '🔔'}
                    </div>
                    <div>
                      <div className={`text-sm ${n.read ? 'font-medium text-slate-200' : 'font-bold text-white'}`}>{n.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{n.body} • {n.time}</div>
                    </div>
                  </div>
                  {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'camera-permission' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Camera & Microphone</h1>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Back to Settings
              </button>
            </div>
            
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cameraActive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Camera Status</div>
                    <div className="text-xs text-slate-400">
                      {cameraActive ? 'Active & Streaming (HD)' : cameraError || 'Permission Required'}
                    </div>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${cameraActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {cameraActive ? 'CONNECTED' : 'OFF'}
                </div>
              </div>

              <div className="relative h-64 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                <video
                  ref={callVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: getFilterStyle() }}
                />
                {!cameraActive && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center space-y-3 z-10">
                    <Camera className="w-10 h-10 text-slate-500 animate-bounce" />
                    <div className="text-sm font-semibold text-white">Camera Access Not Granted</div>
                    <div className="text-xs text-slate-400 max-w-xs">
                      Click the button below to open camera permission prompt in your browser.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={requestCameraPermission}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Camera Permission</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <div className="font-semibold text-slate-300">Troubleshooting Tips:</div>
                <div>• Look for the camera / lock icon in your browser address bar and select "Allow".</div>
                <div>• Ensure no other application is currently using your webcam.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'message-settings' && (
          <div className="space-y-2 animate-fadeIn">
            <h1 className="text-2xl font-bold text-white mb-4">Message Settings</h1>
            <div
              onClick={() => setActiveTab('create-group')}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700"
            >
              <div className="flex items-center gap-3 text-slate-200">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-semibold text-white">Create Group</div>
                  <div className="text-xs text-slate-400">Create a group chat with your friends</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            <div
              onClick={() => setActiveTab('blocked')}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700"
            >
              <div className="flex items-center gap-3 text-slate-200">
                <Shield className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm font-semibold text-white">Blocked Users</div>
                  <div className="text-xs text-slate-400">Manage blocked contacts</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            <div
              onClick={() => handleToggleLowData(!lowDataMode)}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700"
            >
              <div className="flex items-center gap-3 text-slate-200">
                <WifiOff className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-sm font-semibold text-white">Low Data Mode</div>
                  <div className="text-xs text-slate-400">Use smaller photos and videos to save mobile data</div>
                </div>
              </div>
              <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${lowDataMode ? 'bg-blue-600' : 'bg-slate-800'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${lowDataMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create-group' && (
          <div className="space-y-6 animate-fadeIn max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Create Group</h1>
              <button
                onClick={() => {
                  if (!groupNameInput.trim()) {
                    showToast('Please enter a group name');
                    return;
                  }
                  showToast(`Group "${groupNameInput}" created successfully!`);
                  setGroupNameInput('');
                  setSelectedFriends(new Set());
                  setActiveTab('messages');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                CREATE
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Group name</label>
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Select friends</div>
                <div className="space-y-2">
                  {['Samiel', 'Joseph', 'Mary', 'Victor'].map((friend) => {
                    const isSelected = selectedFriends.has(friend);
                    return (
                      <div
                        key={friend}
                        onClick={() => {
                          const updated = new Set(selectedFriends);
                          if (isSelected) updated.delete(friend);
                          else updated.add(friend);
                          setSelectedFriends(updated);
                        }}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                            {friend[0]}
                          </div>
                          <span className="text-sm font-semibold text-white">{friend}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="space-y-4 animate-fadeIn h-[75vh] flex flex-col justify-between bg-black rounded-2xl p-4 border border-slate-800 relative overflow-hidden">
            {/* Live Camera Feed or Simulation Background */}
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ filter: getFilterStyle() }}
            />
            {(!cameraActive || cameraError) && (
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center z-0 p-4">
                <div className="text-center space-y-3 max-w-xs">
                  <div className="w-16 h-16 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center mx-auto animate-pulse">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="text-xs font-bold text-white">Camera Permission Required</div>
                  <button
                    onClick={requestCameraPermission}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg w-full"
                  >
                    Open Camera Permission
                  </button>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none z-0" />

            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-red-600/80 px-3 py-1 rounded-full text-white text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>LIVE {cameraActive ? '• HD Cam' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEffectsSheet(true)}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md cursor-pointer border border-slate-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Effects</span>
                </button>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-lg"
                >
                  End Stream
                </button>
              </div>
            </div>

            {/* Comments Stream */}
            <div className="flex-1 overflow-y-auto space-y-2 z-10 flex flex-col justify-end">
              {liveComments.map((c, i) => (
                <div key={i} className="text-xs text-white bg-black/50 backdrop-blur-md p-2.5 rounded-xl max-w-[80%] border border-white/10">
                  <span className="font-bold text-blue-400 mr-2">{c.username}:</span>
                  <span>{c.message}</span>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="space-y-2 z-10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={liveCommentInput}
                  onChange={(e) => setLiveCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendLiveComment()}
                  placeholder="Say something to the streamer..."
                  className="flex-1 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-full text-xs text-white focus:outline-none focus:border-blue-500 backdrop-blur-md"
                />
                <button
                  onClick={handleSendLiveComment}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full cursor-pointer shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowGiftModal(true)}
                  className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full cursor-pointer shadow-lg"
                  title="Send Gift"
                >
                  <Gift className="w-5 h-5 fill-slate-950" />
                </button>
                <button
                  onClick={() => setLiveLikes(liveLikes + 1)}
                  className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full cursor-pointer shadow-lg"
                >
                  <Heart className="w-4 h-4 fill-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'story' && (
          <div className="space-y-6 animate-fadeIn max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-white text-center">Create Story</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <input
                type="file"
                accept="image/*"
                id="story-file-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (uploadEvent) => {
                      setStoryImage(uploadEvent.target?.result as string);
                      showToast('Photo selected from device storage!');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <div
                onClick={() => document.getElementById('story-file-input')?.click()}
                className="h-64 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 cursor-pointer overflow-hidden hover:border-slate-700 relative"
              >
                {storyImage ? (
                  <img src={storyImage} alt="Selected story" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-12 h-12 mb-2 text-blue-500" />
                    <span className="text-xs text-slate-300 font-semibold">Tap to pick image from phone storage</span>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  if (!storyImage) {
                    showToast('Please pick an image from storage first');
                    return;
                  }
                  setStories(stories.map((s, idx) => idx === 0 ? { ...s, views: s.views + 1, likes: s.likes + 1 } : s));
                  setStoryImage(null);
                  showToast('Story posted successfully!');
                  setActiveTab('home');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                POST STORY
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Bythex AI Studio</h1>
                <p className="text-xs text-slate-400 mt-1">Generate 1K/2K/4K images and intelligent text.</p>
              </div>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setAiMode('image')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    aiMode === 'image' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Image
                </button>
                <button
                  onClick={() => setAiMode('text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    aiMode === 'text' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Text
                </button>
              </div>
            </div>

            {aiMode === 'image' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <textarea
                  rows={3}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGeneratingImage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  <span>Generate AI Image ({imageSize}, {aspectRatio})</span>
                </button>

                {generatedImageResult && (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={generatedImageResult} alt="AI Artwork" referrerPolicy="no-referrer" className="w-full max-h-80 object-contain" />
                    </div>
                    <button
                      onClick={handleDownloadImage}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download / Save Image</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <textarea
                  rows={4}
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
                <button
                  onClick={handleGenerateText}
                  disabled={isGeneratingText}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs cursor-pointer"
                >
                  {isGeneratingText ? 'Generating...' : 'Execute Intelligence Task'}
                </button>

                {generatedTextResult && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-wrap">
                    {generatedTextResult}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md z-40 flex items-center justify-around py-3">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'home' ? 'text-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'messages' ? 'text-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">Messages</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'search' ? 'text-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'videos' ? 'text-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-5 h-5" />
          <span className="text-[10px]">Videos</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${
            activeTab === 'profile' ? 'text-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>

      {/* Video / Voice Call Modal Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 animate-fadeIn">
          {/* Call Header */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                {activeChatUser?.[0] || 'S'}
              </div>
              <div>
                <div className="font-bold text-base">{activeChatUser || 'Samiel'}</div>
                <div className="text-xs text-emerald-400 font-medium">Connected • 02:45</div>
              </div>
            </div>
            <button
              onClick={() => setActiveCall(null)}
              className="p-2.5 bg-slate-800 text-slate-300 rounded-full hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Call Video / Audio Feed Area */}
          <div className="relative flex-1 my-6 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {activeCall === 'video' && !videoMuted ? (
              <>
                <video
                  ref={callVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover z-0 ${blurBgEnabled ? 'backdrop-blur-xl' : ''}`}
                  style={{ filter: getFilterStyle() }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-0" />
                <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{activeChatUser || 'Samiel'} (HD Video)</span>
                  </div>
                  {beautyEnabled && <div className="text-[10px] text-pink-400 font-semibold">✨ Beauty Active</div>}
                  {selectedFilter !== 'Normal' && <div className="text-[10px] text-blue-400 font-semibold">🎨 {selectedFilter}</div>}
                </div>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto animate-pulse">
                  <Phone className="w-8 h-8" />
                </div>
                <div className="text-lg font-bold">Voice Call Active</div>
                <div className="text-xs text-slate-400">Encrypted HD Audio Connection</div>
              </div>
            )}
          </div>

          {/* Call Control Bar */}
          <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-3xl p-4 flex items-center justify-around">
            <button
              onClick={() => setCallMuted(!callMuted)}
              className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                callMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Music className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{callMuted ? 'Unmute' : 'Mic'}</span>
            </button>

            <button
              onClick={() => showToast('Camera flipped')}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl flex flex-col items-center gap-1 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Flip</span>
            </button>

            <button
              onClick={() => setShowEffectsSheet(true)}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl flex flex-col items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-[10px] font-semibold">Effects</span>
            </button>

            {activeCall === 'video' && (
              <button
                onClick={() => setVideoMuted(!videoMuted)}
                className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  videoMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Video className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{videoMuted ? 'Cam Off' : 'Camera'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveCall(null);
                showToast('Call ended');
              }}
              className="p-3.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex flex-col items-center gap-1 cursor-pointer shadow-lg shadow-red-600/30"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-semibold">End</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Stream / Go Live Modal Overlay */}
      {isLiveActive && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold border border-red-500/40">
                S
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">@samiel</span>
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md animate-pulse">LIVE</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>{liveViewersCount}</span>
              </div>
              <button
                onClick={() => setIsLiveActive(false)}
                className="p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Broadcast Preview */}
          <div className="relative flex-1 my-6 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ filter: getFilterStyle() }}
            />
            {(!cameraActive || cameraError) && (
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center z-0 p-4">
                <div className="text-center space-y-3 max-w-xs">
                  <div className="w-16 h-16 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center mx-auto border border-red-500/50 animate-pulse">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-bold text-white">Camera Permission Required</div>
                  <div className="text-xs text-slate-400">Allow camera and microphone access to broadcast live.</div>
                  <button
                    onClick={requestCameraPermission}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg w-full"
                  >
                    Open Camera Permission
                  </button>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none z-0" />

            {/* Floating Effects Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowEffectsSheet(true)}
                className="px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md cursor-pointer border border-slate-700 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Effects</span>
              </button>
            </div>
          </div>

          {/* Live Chat Comments & Controls */}
          <div className="space-y-4">
            <div className="h-36 overflow-y-auto space-y-2 pr-2">
              {liveCommentsList.map((comm, idx) => (
                <div key={idx} className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-3 py-2 rounded-xl text-xs">
                  <span className="font-bold text-blue-400 mr-2">{comm.username}</span>
                  <span className="text-slate-200">{comm.text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={liveCommentInput}
                onChange={(e) => setLiveCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && liveCommentInput.trim()) {
                    setLiveCommentsList([...liveCommentsList, { username: 'You', text: liveCommentInput.trim() }]);
                    setLiveCommentInput('');
                  }
                }}
                placeholder="Say something to viewers..."
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-red-500"
              />
              <button
                onClick={() => {
                  setLiveLikesCount(liveLikesCount + 1);
                  showToast('❤️ Liked live stream!');
                }}
                className="p-3 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl hover:bg-red-600/30 cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-red-500" />
              </button>
              <button
                onClick={() => {
                  setShowEffectsSheet(true);
                }}
                className="p-3 bg-slate-800 text-yellow-400 rounded-2xl hover:bg-slate-700 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (!liveCommentInput.trim()) return;
                  setLiveCommentsList([...liveCommentsList, { username: 'You', text: liveCommentInput.trim() }]);
                  setLiveCommentInput('');
                }}
                className="p-3 bg-blue-600 text-white rounded-2xl cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Effects Sheet Modal (`BythexEffectsSheet`) */}
      {showEffectsSheet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#111118] border border-slate-800 rounded-t-[30px] p-6 space-y-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>✨ Bythex Effects</span>
              </h3>
              <button onClick={() => setShowEffectsSheet(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div>
                  <div className="font-bold text-sm">Beauty Enhance</div>
                  <div className="text-xs text-slate-400">Smooth and enhance your face</div>
                </div>
                <input
                  type="checkbox"
                  checked={beautyEnabled}
                  onChange={(e) => setBeautyEnabled(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div>
                  <div className="font-bold text-sm">Background Blur</div>
                  <div className="text-xs text-slate-400">Blur background during video calls</div>
                </div>
                <input
                  type="checkbox"
                  checked={blurBgEnabled}
                  onChange={(e) => setBlurBgEnabled(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Filters</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['Normal', 'Warm', 'Cool', 'Bright', 'Vintage', 'Black & White'].map((filt) => (
                    <button
                      key={filt}
                      onClick={() => setSelectedFilter(filt)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap cursor-pointer transition-all ${
                        selectedFilter === filt ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {filt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowEffectsSheet(false)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {viewingUserProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 relative shadow-2xl">
            <button 
              onClick={() => setViewingUserProfile(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-3 pt-2">
              <div className="w-24 h-24 rounded-full bg-blue-600/25 border-2 border-blue-500 text-blue-400 flex items-center justify-center text-4xl font-bold mx-auto shadow-inner">
                {viewingUserProfile.name[0]}
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="text-xl font-bold text-white">{viewingUserProfile.name}</h2>
                  {viewingUserProfile.isVerified && (
                    <Verified className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                  )}
                </div>
                <div className="text-xs text-blue-400 font-medium">@{viewingUserProfile.name.toLowerCase().replace(/\s+/g, '')}</div>
              </div>

              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                {viewingUserProfile.bio || 'Bythex community creator and verified member.'}
              </p>

              <div className="flex justify-center gap-6 py-2 border-y border-slate-800">
                <div>
                  <div className="text-base font-bold text-white">1,420</div>
                  <div className="text-[10px] text-slate-400">Followers</div>
                </div>
                <div>
                  <div className="text-base font-bold text-white">342</div>
                  <div className="text-[10px] text-slate-400">Following</div>
                </div>
                <div>
                  <div className="text-base font-bold text-white">48</div>
                  <div className="text-[10px] text-slate-400">Posts</div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    showToast(`Following ${viewingUserProfile.name}!`);
                    setViewingUserProfile(null);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs cursor-pointer transition-colors shadow-lg shadow-blue-600/20"
                >
                  Follow
                </button>
                <button
                  onClick={() => {
                    showToast(`Opening chat with ${viewingUserProfile.name}...`);
                    setActiveTab('messages');
                    setViewingUserProfile(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs cursor-pointer transition-colors border border-slate-700"
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {selectedStoryViewer && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-fadeIn select-none">
          {/* Top Progress & Header */}
          <div className="space-y-3 pt-2">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                  {selectedStoryViewer.name[0]}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{selectedStoryViewer.name}</div>
                  <div className="text-[10px] text-slate-400">👁 {selectedStoryViewer.views} views</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStoryViewer(null)}
                className="p-2 bg-slate-800/80 text-white rounded-full hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Story Media / Content Area */}
          <div className="relative flex-1 my-4 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-3xl font-bold shadow-2xl">
                {selectedStoryViewer.name[0]}
              </div>
              <div className="text-xl font-bold text-white">{selectedStoryViewer.name}'s Story Update</div>
              <p className="text-xs text-slate-300 max-w-xs">Sharing wonderful moments on Bythex today! ✨</p>
            </div>
          </div>

          {/* Bottom Reaction Bar */}
          <div className="flex items-center justify-around pb-2">
            <button
              onClick={() => {
                setStories(stories.map(s => s.name === selectedStoryViewer.name ? { ...s, likes: s.likes + 1 } : s));
                setSelectedStoryViewer({ ...selectedStoryViewer, likes: selectedStoryViewer.likes + 1 });
                showToast('Liked story ❤️');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-red-400 hover:bg-slate-800 cursor-pointer shadow-lg"
            >
              <Heart className="w-5 h-5 fill-red-500" />
              <span>{selectedStoryViewer.likes}</span>
            </button>

            <button
              onClick={() => {
                setStories(stories.map(s => s.name === selectedStoryViewer.name ? { ...s, cries: s.cries + 1 } : s));
                setSelectedStoryViewer({ ...selectedStoryViewer, cries: selectedStoryViewer.cries + 1 });
                showToast('Reacted with 😢');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-blue-400 hover:bg-slate-800 cursor-pointer shadow-lg"
            >
              <span>😢</span>
              <span>{selectedStoryViewer.cries}</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Lock PIN Modal */}
      {showChatPinModal && targetPartnerForPin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>{isSettingNewPin ? `Set PIN for ${targetPartnerForPin}` : `Enter PIN to Unlock ${targetPartnerForPin}`}</span>
              </h3>
              <button onClick={() => setShowChatPinModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">4-Digit Chat PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={chatPinInput}
                  onChange={(e) => setChatPinInput(e.target.value)}
                  placeholder="••••"
                  className={`w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xl text-white text-center font-mono tracking-widest focus:outline-none focus:border-amber-500 ${pinShake ? 'animate-shake border-red-500' : ''}`}
                />
              </div>

              <button
                onClick={() => {
                  if (chatPinInput.length < 4) {
                    showToast('Enter a 4-digit PIN');
                    return;
                  }
                  if (isSettingNewPin) {
                    const nextPins = { ...chatPins, [targetPartnerForPin]: chatPinInput };
                    setChatPins(nextPins);
                    try { localStorage.setItem('bythex_chat_pins', JSON.stringify(nextPins)); } catch {}
                    setUnlockedChats({ ...unlockedChats, [targetPartnerForPin]: true });
                    setShowChatPinModal(false);
                    setChatPinInput('');
                    showToast(`Chat locked successfully with PIN for ${targetPartnerForPin} 🔒`);
                  } else {
                    if (chatPins[targetPartnerForPin] === chatPinInput) {
                      setUnlockedChats({ ...unlockedChats, [targetPartnerForPin]: true });
                      setActiveChatUser(targetPartnerForPin);
                      setShowChatPinModal(false);
                      setChatPinInput('');
                      showToast('Chat unlocked successfully 🔓');
                    } else {
                      setPinShake(true);
                      setTimeout(() => setPinShake(false), 400);
                      showToast('Incorrect PIN. Please try again.');
                    }
                  }
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isSettingNewPin ? 'LOCK CHAT' : 'UNLOCK CHAT'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
