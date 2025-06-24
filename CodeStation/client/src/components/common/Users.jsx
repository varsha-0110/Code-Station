import { useAppContext } from "@/context/AppContext";
import Avatar from "react-avatar";
import PropTypes from "prop-types";

// Constants to replace enum
const USER_CONNECTION_STATUS = {
    ONLINE: "online",
    OFFLINE: "offline",
};

/**
 * Users list component that renders all connected users with avatars.
 */
function Users() {
    const { users } = useAppContext();

    return (
        <div className="flex min-h-[200px] flex-grow justify-center overflow-y-auto py-2">
            <div className="flex h-full w-full flex-wrap items-start gap-x-2 gap-y-6">
                {users.map((user) => (
                    <User key={user.socketId} user={user} />
                ))}
            </div>
        </div>
    );
}

/**
 * Individual user card with avatar and online/offline indicator.
 * @param {{ user: { username: string, status: string } }} props
 */
const User = ({ user }) => {
    const { username, status } = user;
    const title = `${username} - ${
        status === USER_CONNECTION_STATUS.ONLINE ? "online" : "offline"
    }`;

    return (
        <div
            className="relative flex w-[100px] flex-col items-center gap-2"
            title={title}
        >
            <Avatar name={username} size="50" round={"12px"} title={title} />
            <p className="line-clamp-2 max-w-full text-ellipsis break-words">
                {username}
            </p>
            <div
                className={`absolute right-5 top-0 h-3 w-3 rounded-full ${
                    status === USER_CONNECTION_STATUS.ONLINE
                        ? "bg-green-500"
                        : "bg-danger"
                }`}
            ></div>
        </div>
    );
};

User.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
    }).isRequired,
};

export default Users;

