import { User } from '../types/auth';
import { UserRequest } from '../types/api/user';
import { CustomerRequest } from '../types/api/customer';
import { adminUsersApi } from '../api/admin/usersApi';
import { managerUsersApi } from '../api/manager/usersApi';
import { adminCustomersApi } from '../api/admin/customersApi';
import { managerCustomersApi } from '../api/manager/customersApi';
import { customerApi } from '../api/customerApi';
import { isAdmin } from './roleUtils';

/**
 * User service selector based on user role
 * Returns appropriate API methods for user CRUD operations
 */
export const getUserService = (authUser: User | null) => {
  if (!authUser) return null;
  
  const userIsAdmin = isAdmin(authUser);
  const storeId = Array.isArray(authUser.storeIds) 
    ? authUser.storeIds[0] 
    : authUser.storeIds;

  return {
    create: (request: UserRequest) => 
      userIsAdmin 
        ? adminUsersApi.createUser(request) 
        : managerUsersApi.createUser(storeId!, request),
    update: (id: string, request: UserRequest) => 
      userIsAdmin 
        ? adminUsersApi.updateUser(id, request) 
        : managerUsersApi.updateUser(storeId!, id, request),
    delete: (id: string) => 
      userIsAdmin 
        ? adminUsersApi.deleteUser(id) 
        : managerUsersApi.deleteUser(storeId!, id),
  };
};

/**
 * Customer service selector based on user role
 * Returns appropriate API methods for customer CRUD operations
 */
export const getCustomerService = (authUser: User | null) => {
  if (!authUser) return null;
  
  const userIsAdmin = isAdmin(authUser);
  const storeId = Array.isArray(authUser.storeIds) 
    ? authUser.storeIds[0] 
    : authUser.storeIds;

  return {
    create: (data: CustomerRequest) => 
      userIsAdmin 
        ? adminCustomersApi.createCustomer(data) 
        : managerCustomersApi.createCustomer(data),
    update: (id: string, data: CustomerRequest) => 
      customerApi.updateProfile(id, data),
    delete: (id: string) => 
      userIsAdmin 
        ? adminCustomersApi.deleteCustomer(id) 
        : managerCustomersApi.deleteCustomer(storeId!, id),
  };
};
