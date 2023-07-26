export class OnlineUsers {
  private onlineUsers: Map<string, string>;

  constructor() {
    this.onlineUsers = new Map<string, string>();
  }

  addUser(userId: string, socketId: string) {
    this.onlineUsers.set(userId, socketId);
  }

  getUserIdBySocketId(socketId: string): string {
    let foundedKey = "";
    this.onlineUsers.forEach((value, key) => {
      if (value === socketId) {
        foundedKey = key;
      }
    });

    return foundedKey;
  }

  removeUser(socketId: string) {
    const beRemovedKey = this.getUserIdBySocketId(socketId);
    this.onlineUsers.delete(beRemovedKey);
  }

  get(userId: string): string | undefined {
    return this.onlineUsers.get(userId);
  }
}
