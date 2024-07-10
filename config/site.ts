export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Riccardo Mazza",
  description: "AI Chatbot",
  navItems: [
    {
      'value': 'Chat',
      'label': 'Chat',
      'href': '/chat',
      'allow_user': true,
      'language': 'en'
    },
    {
      'value': 'Chat',
      'label': 'Chat',
      'href': '/chat',
      'allow_user': true,
      'language': 'it'
    },
    {
      'value': 'Agents',
      'label': 'Agents',
      'href': '/agents',
      'allow_user': false,
      'language': 'en'
    },
    {
      'value': 'Agents',
      'label': 'Agenti',
      'href': '/agents',
      'allow_user': false,
      'language': 'it'
    },
  ],
  navMenuItems: [
    {
      'value': 'Chat',
      'label': 'Chat',
      'href': '/chat',
      'allow_user': true,
      'language': 'en'
    },
    {
      'value': 'Chat',
      'label': 'Chat',
      'href': '/chat',
      'allow_user': true,
      'language': 'it'
    },
    {
      'value': 'Agents',
      'label': 'Agents',
      'href': '/agents',
      'allow_user': false,
      'language': 'en'
    },
    {
      'value': 'Agents',
      'label': 'Agenti',
      'href': '/agents',
      'allow_user': false,
      'language': 'it'
    },
  ]
};
