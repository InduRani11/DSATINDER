export class AuthValidator {
  public static validateRegisterInput(data: {
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    collegeId?: string;
  }): string | null {
    if (!data.name || data.name.trim().length < 2) {
      return 'Full name must be at least 2 characters long.';
    }

    if (!data.username || !/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
      return 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.';
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return 'Please enter a valid email address.';
    }

    if (!data.password || data.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (!data.collegeId) {
      return 'Selecting a college is required.';
    }

    return null;
  }
}
