export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Riccardo Mazza",
  description: "AI Chatbot",
  navItems: [
    {
      'label': 'Chat',
      'href': '/chat',
      'allow_user': true
    },
  ],
  navMenuItems: [
    {
      'label': 'Chat',
      'href': '/chat',
      'allow_user': true
    },
  ]
};
