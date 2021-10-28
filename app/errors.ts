export type Errors =
  | "core/database_panicked"
  | "core/internal_server_error"
  | "common/wrong_arguments"
  | "user/not_exist"
  | "user/exist"
  | "user/login_required"
  | "user/logout_required"
  | "user/password_wrong"
  | "user/permission_denied";
