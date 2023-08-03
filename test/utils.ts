export const INTERFACE_IDS = {
  IERC20: '0x36372b07',
  IERC165: '0x01ffc9a7',
  IWunder: '0xe081a4b5',
  IAccessControl: '0x01ffc9a7',
}

export const name = "Wunderpar";
export const symbol = "WUNDR";

export const REVERT_MESSAGES: { [key: string]: any } = {
  missingRole: (role: string, account: string) => `AccessControl: account ${account.toLowerCase()} is missing role ${role}`,
  noDirectAdminGrant: "AccessControl: can't directly grant default admin role",
  deplayNotPassed: "AccessControl: transfer delay not passed",
} 