# Next.js & NextUI Template

This is a template for creating applications using Next.js 14 (app directory) and NextUI (v2).

[Try it on CodeSandbox](https://githubbox.com/nextui-org/next-app-template)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [NextUI v2](https://nextui.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## How to Use

### Use the template with create-next-app

To create a new project based on this template using `create-next-app`, run the following command:

```bash
npx create-next-app -e https://github.com/nextui-org/next-app-template
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@nextui-org/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/nextui-org/next-app-template/blob/main/LICENSE).

# Low Content AI Frontend

This is the frontend application for Low Content AI, built with Next.js.

## Endorsely Integration

This application integrates with Endorsely for referral tracking. The integration includes:

### Setup
- Endorsely script is automatically loaded in the main layout (`app/layout.tsx`)
- Script ID: `2f92e228-4ddb-44e0-921b-11fb35bd7a39`

### Usage
- Referral IDs are automatically captured when users visit the site through Endorsely links
- The referral ID is passed to the backend during subscription creation
- Utility functions are available in `utils/endorsely.js` for working with Endorsely data

### Implementation Details
- The `startSubscription` function in `managers/subscriptionManager.js` accepts an `endorsely_referral` parameter
- Components that trigger subscriptions (signup flow, subscription modal) automatically include the referral ID
- TypeScript declarations are included for the `window.endorsely_referral` property

## Getting Started
