import { Users } from "lucide-react";

// Inspect type of Users
export type UsersType = typeof Users;

// Try to extract props type
export type UsersProps = React.ComponentProps<typeof Users>;
