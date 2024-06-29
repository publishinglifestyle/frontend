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
    {
      'label': 'Agents',
      'href': '/agents',
      'allow_user': false
    },
  ],
  navMenuItems: [
    {
      'label': 'Chat',
      'href': '/chat',
      'allow_user': true
    },
    {
      'label': 'Agents',
      'href': '/agents',
      'allow_user': false
    },
  ]
};
