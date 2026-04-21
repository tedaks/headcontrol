export interface User {
  id: string;
  name: string;
  displayName: string;
  email: string;
  providerId: string;
  provider: string;
  profilePicUrl: string;
  createdAt: string;
}

export interface Node {
  id: string;
  machineKey: string;
  nodeKey: string;
  discoKey: string;
  ipAddresses: string[];
  name: string;
  user: User;
  lastSeen: string;
  expiry: string;
  createdAt: string;
  registerMethod: RegisterMethod;
  givenName: string;
  online: boolean;
  approvedRoutes: string[];
  availableRoutes: string[];
  subnetRoutes: string[];
  tags: string[];
}

export type RegisterMethod =
  | 'REGISTER_METHOD_UNSPECIFIED'
  | 'REGISTER_METHOD_AUTH_KEY'
  | 'REGISTER_METHOD_CLI'
  | 'REGISTER_METHOD_OIDC';

export interface PreAuthKey {
  user: User;
  id: string;
  key: string;
  reusable: boolean;
  ephemeral: boolean;
  used: boolean;
  expiration: string;
  createdAt: string;
  aclTags: string[];
}

export interface ApiKey {
  id: string;
  prefix: string;
  expiration: string;
  createdAt: string;
  lastSeen: string;
}

export type RegisterMethodLabel = 'Unspecified' | 'Auth Key' | 'CLI' | 'OIDC';

export const REGISTER_METHOD_LABELS: Record<RegisterMethod, RegisterMethodLabel> = {
  REGISTER_METHOD_UNSPECIFIED: 'Unspecified',
  REGISTER_METHOD_AUTH_KEY: 'Auth Key',
  REGISTER_METHOD_CLI: 'CLI',
  REGISTER_METHOD_OIDC: 'OIDC',
};
