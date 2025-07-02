import User from '../models/User';
import UserRole from '../models/UserRole';
import Subscription from '../models/Subscription';

export interface UserStats {
  maxAdmins: number | 'unlimited';
  maxTeachers: number | 'unlimited';
  maxParents: number | 'unlimited';
  maxStudents: number | 'unlimited';
  usedAdmins: number;
  usedTeachers: number;
  usedParents: number;
  usedStudents: number;
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // Get user's active subscription
    const subscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'trialing'] }
    }).populate('plan');

    if (!subscription || !subscription.plan) {
      // Return default stats if no active subscription
      return {
        maxAdmins: 0,
        maxTeachers: 0,
        maxParents: 0,
        maxStudents: 0,
        usedAdmins: 0,
        usedTeachers: 0,
        usedParents: 0,
        usedStudents: 0
      };
    }

    const plan = subscription.plan as any;
    let maxStats = {
      admin: plan.maxUsers.admin,
      teacher: plan.maxUsers.teacher,
      parent: plan.maxUsers.parent,
      student: plan.maxUsers.student
    };

    // Apply add-ons to max limits
    subscription.addOns.forEach((addOn: any) => {
      if (addOn.type in maxStats) {
        const currentMax = maxStats[addOn.type as keyof typeof maxStats];
        if (typeof currentMax === 'number') {
          maxStats[addOn.type as keyof typeof maxStats] = currentMax + addOn.quantity;
        } else {
          // If current max is 'unlimited', keep it unlimited
          maxStats[addOn.type as keyof typeof maxStats] = 'unlimited';
        }
      }
    });

    // Get role IDs for each user type
    const roles = await UserRole.find({
      role: { $in: ['admin', 'teacher', 'parent', 'student'] }
    });

    const roleMap: { [key: string]: string } = {};
    roles.forEach(role => {
      roleMap[role.role] = (role._id as any).toString();
    });

    // Get the current user to determine institution
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error('Current user not found');
    }

    // Count used users for each role within the same institution
    const usedStats = {
      admin: 0,
      teacher: 0,
      parent: 0,
      student: 0
    };

    // Count users for each role within the same institution
    for (const [roleName, roleId] of Object.entries(roleMap)) {
      const query: any = {
        role: roleId,
        isActive: true
      };

      // If user has institution name, filter by institution
      if (currentUser.institutionName) {
        query.institutionName = currentUser.institutionName;
      }

      const count = await User.countDocuments(query);
      usedStats[roleName as keyof typeof usedStats] = count;
    }

    return {
      maxAdmins: maxStats.admin,
      maxTeachers: maxStats.teacher,
      maxParents: maxStats.parent,
      maxStudents: maxStats.student,
      usedAdmins: usedStats.admin,
      usedTeachers: usedStats.teacher,
      usedParents: usedStats.parent,
      usedStudents: usedStats.student
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new Error('Failed to get user statistics');
  }
};

export const getSystemStats = async (): Promise<UserStats> => {
  try {
    // Get all active subscriptions
    const activeSubscriptions = await Subscription.find({
      status: { $in: ['active', 'trialing'] }
    }).populate('plan');

    // Calculate total max users across all active subscriptions
    let totalMaxStats = {
      admin: 0,
      teacher: 0,
      parent: 0,
      student: 0
    };

    activeSubscriptions.forEach((subscription: any) => {
      const plan = subscription.plan;
      if (plan && plan.maxUsers) {
        // Add base plan limits
        Object.keys(plan.maxUsers).forEach((key) => {
          const planValue = plan.maxUsers[key];
          if (typeof planValue === 'number') {
            totalMaxStats[key as keyof typeof totalMaxStats] += planValue;
          }
        });

        // Add add-on limits
        subscription.addOns.forEach((addOn: any) => {
          if (addOn.type in totalMaxStats) {
            totalMaxStats[addOn.type as keyof typeof totalMaxStats] += addOn.quantity;
          }
        });
      }
    });

    // Get role IDs for each user type
    const roles = await UserRole.find({
      role: { $in: ['admin', 'teacher', 'parent', 'student'] }
    });

    const roleMap: { [key: string]: string } = {};
    roles.forEach(role => {
      roleMap[role.role] = (role._id as any).toString();
    });

    // Count used users for each role system-wide
    const usedStats = {
      admin: 0,
      teacher: 0,
      parent: 0,
      student: 0
    };

    // Count users for each role
    for (const [roleName, roleId] of Object.entries(roleMap)) {
      const count = await User.countDocuments({
        role: roleId,
        isActive: true
      });
      usedStats[roleName as keyof typeof usedStats] = count;
    }

    return {
      maxAdmins: totalMaxStats.admin,
      maxTeachers: totalMaxStats.teacher,
      maxParents: totalMaxStats.parent,
      maxStudents: totalMaxStats.student,
      usedAdmins: usedStats.admin,
      usedTeachers: usedStats.teacher,
      usedParents: usedStats.parent,
      usedStudents: usedStats.student
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    throw new Error('Failed to get system statistics');
  }
};

export interface HistoricalStats {
  month: string;
  totalUsers: number;
  admins: number;
  teachers: number;
  parents: number;
  students: number;
}

export const getHistoricalStats = async (userId: string): Promise<HistoricalStats[]> => {
  try {
    // Get the current user to determine institution
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error('Current user not found');
    }

    // Get role IDs for each user type
    const roles = await UserRole.find({
      role: { $in: ['admin', 'teacher', 'parent', 'student'] }
    });

    const roleMap: { [key: string]: string } = {};
    roles.forEach(role => {
      roleMap[role.role] = (role._id as any).toString();
    });

    // Generate last 6 months
    const months = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }

    const historicalData: HistoricalStats[] = [];

    for (const monthData of months) {
      const startOfMonth = new Date(monthData.year, monthData.month, 1);
      const endOfMonth = new Date(monthData.year, monthData.month + 1, 0, 23, 59, 59, 999);

      // Base query for institution filtering
      const baseQuery: any = {
        isActive: true,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      };

      // If user has institution name, filter by institution
      if (currentUser.institutionName) {
        baseQuery.institutionName = currentUser.institutionName;
      }

      // Count users for each role up to this month
      const adminCount = await User.countDocuments({
        ...baseQuery,
        role: roleMap['admin']
      });

      const teacherCount = await User.countDocuments({
        ...baseQuery,
        role: roleMap['teacher']
      });

      const parentCount = await User.countDocuments({
        ...baseQuery,
        role: roleMap['parent']
      });

      const studentCount = await User.countDocuments({
        ...baseQuery,
        role: roleMap['student']
      });

      const totalUsers = adminCount + teacherCount + parentCount + studentCount;

      historicalData.push({
        month: monthData.label,
        totalUsers,
        admins: adminCount,
        teachers: teacherCount,
        parents: parentCount,
        students: studentCount
      });
    }

    return historicalData;
  } catch (error) {
    console.error('Error getting historical stats:', error);
    throw new Error('Failed to get historical statistics');
  }
}; 