export type User = {
  _id: string;
  os: string;
  initials: string;
  backgroundColor: string;
  nickname: string;
  picture: string;
  userId: string;
  statusFollow: string;
  following: { userId: string }[];
  followers: { userId: string }[];
  profilePicture: string;
  firstName: string;
  lastName: string;
  aboutMe: string;
  type: string;
  userName: string;
  facebookUrl: string
  instagramUrl: string
  linkedinUrl: string
  isAchievements: boolean; //push notif
  isChats: boolean; //push notif
  isComments: boolean; //push notif
  isFollowers: boolean; //push notif
  isReplies: boolean; //push notif
  isLikes: boolean; //push notif
  descriptionAboutMe: string;
  city: string;
  totalEarned: string;
  country: string;
  mutualConnections: number;
  aboutProfile: string;
  backgroundPicture: string;
  lookingQuitters: boolean;
  lookingCoach: boolean;
  timezone: string;
  pushToken: string;
  coaches: {
    planStart: string;
    planEnd: string;
    email: string;
    amount: number;
    amountForUs: number;
    userId: string;
    fullName: string;
  }[];
  quitters: {
    planStart: string;
    planEnd: string;
    email: string;
    amount: number;
    amountForUs: number;
    userId: string;
    fullName: string;
  }[];
  idsPostLucky: Post[]
  doneTutorialCommunities: boolean
};

export type Post = {
  _id: number;
  userId: string;
  userName: string;
  idv4:string;
  firstName: string;
  lastName: string;
  timeAgo: string;
  pictureUser: string;
  picturePost: string;
  allowComments: boolean;
  backgroundColor: string;
  initials: string;
  userType: string;
  likes: {
    userName: string;
    profilePicture: string;
  }[];
  description: string;
  comments: {
    userName: string;
    comment: string;
    likes: { userName: string }[];
    replies: {
      userName: string;
      comment: string;
      likes: { userName: string }[];
    }[];
  }[];
  expirationDate: string;
};

export type Module = {
  [key: string]: {
    id: string;
    title: string;
    short: string;
    thumb: string;
    thumbLocal: string;
    day: number;
    uploadedImage: string;
    uploadedImageLocal: string;
    video: string;
    videoLocal: string;
    youTubeId: string;
    fullDescription: string;
  }[];
};

export type TypeUser = {
  planStart: string;
  planEnd: string;
  email: string;
  amount: number;
  amountForUs: number;
  userId: string;
  fullName: string;
};

export type Message = {
  _id?: string;
  sender: string;
  receiver: string;
  receiverFullName: string;
  receiverProfilePicture: string;
  initialsReceiver: string;
  backgroundColorReceiver: string;
  initialsSender: string;
  backgroundColorSender: string;
  senderFullName: string;
  profilePictureSender: string;
  iAmReceiver: boolean;
  messages: {
    profilePicture: string;
    senderFullName: string;
    date: string;
    message: string;
    isNotification: boolean;
    initialsSender: string;
    backgroundColorSender: string;
    isRead: boolean;
    dateDefault: Date
  }[];
};

export type EventCalendar = {
  quitterId: string;
  coachId: string;
  meetDate: string | undefined;
  duration: string;
  shortDescription: string;
};

export type NotificationType = {
  _id?: string;
  sender: string;
  receiver: string;
  date: string;
  profilePictureSender: string;
  body: string;
  type: string;
  isRead?: boolean;
  senderFullName: string;
  amountPayment?: number | string;
  postId?: string;
  calendarEvent?: {
    quitterId?: string;
    coachId?: string;
    meetDate?: string | undefined;
    duration?: string;
    shortDescription?: string;
  };
  payment?: {
    type?: string;
    quantity?: number;
  };
  isRejectedCalendar?: boolean;
  isRejectedPayment?: boolean;
  roomId?: string;
  initials: string;
  backgroundColor: string;
  expirationDate: string
};

export type MessageBody = {
  sender: string;
  receiver: string;
  message: string;
  date: string;
  profilePicture: string;
  isNotification: boolean;
  senderFullName: string;
  receiverFullName: string;
  receiverProfilePicture: string;
  initialsSender: string;
  backgroundColorSender: string;
  initialsReceiver: string;
  backgroundColorReceiver: string;
};

export type Coach = {
  firstName: string;
  lastName: string;
  aboutMe: string;
  followers: { userId: string }[];
  profilePicture: string;
  userId: string;
  to: string;
  descriptionAboutMe: string;
  initials: string;
  backgroundColor: string;
};

export interface IRating {
  userId: string;
  stars: number;
  comment: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  date: string;
  initials: string;
  backgroundColor: string;
}

export type Comment = {
  _id: number;
  profilePicture: string;
  userName: string;
  likes: { userName: string }[];
  comment: string;
  timeAgo: string;
  initials: string;
  backgroundColor: string;
  idv4: string;
  replies: {
    _id: number;
    userName: string;
    comment: string;
    timeAgo: string;
    initials: string;
    backgroundColor: string;
    likes: { userName: string }[];
    profilePicture: string;
  }[];
};

export interface IPlan {
  planStart: string;
  planEnd: string;
  email: string;
  amount: number;
  amountForUs: number;
  userId: string;
  fullName: string;
}
