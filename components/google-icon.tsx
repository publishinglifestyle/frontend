import type { IconBaseProps } from "react-icons";

import { FaGoogle } from "react-icons/fa";

// Wrap react-icons' ReactNode return type for the project's TypeScript 5.0 JSX.
export const GoogleIcon = (props: IconBaseProps) => <>{FaGoogle(props)}</>;
