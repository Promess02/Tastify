interface User {
    user_id: number;
    email: string;
    password: string;
    permission: 'user' | 'admin';
    block: 'blocked' | 'active';
};

export default User;