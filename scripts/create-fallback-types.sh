#!/bin/bash

echo "Creating protobuf type definitions..."

# Clean old type files
rm -rf ./types/generated
mkdir -p ./types/generated

# Check if protoc is available
if ! command -v protoc &> /dev/null; then
    echo "protoc not found, creating minimal fallback types..."
    mkdir -p ./types/generated/api/users
    cat > ./types/generated/api/users/user_auth.ts << 'AUTHEOF'
export enum LoginType {
  LOGIN_TYPE_UNSPECIFIED = 'LOGIN_TYPE_UNSPECIFIED',
  LOGIN_TYPE_EMAIL = 'LOGIN_TYPE_EMAIL',
  LOGIN_TYPE_USERNAME = 'LOGIN_TYPE_USERNAME',
}
export interface LoginRequest { username?: string; password?: string; }
export interface LoginResponse { token?: string; }
export interface RegisterRequest { username?: string; email?: string; password?: string; }
export interface RegisterResponse { user?: { id?: string; username?: string; }; }
AUTHEOF
    echo "Created minimal fallback types."
    exit 0
fi

# Use protoc to generate correct type definitions
echo "Generating TypeScript types from protobuf files..."

# Check protoc plugin
if [ ! -f "./node_modules/.bin/protoc-gen-ts_proto" ]; then
    echo "protoc-gen-ts_proto plugin not found, please run: npm install"
    exit 1
fi

# Generate types from all proto files
find proto -name "*.proto" -exec protoc \
    --plugin=./node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_out=./types/generated \
    --ts_proto_opt=stringEnums=true,snakeToCamel=true,useOptionals=all,onlyTypes=true \
    --proto_path=./proto \
    --proto_path=/usr/include \
    {} \;

if [ $? -eq 0 ]; then
    echo "TypeScript types generated successfully from protobuf files!"
    echo "Generated $(find types/generated -name "*.ts" | wc -l) type files."
else
    echo "Failed to generate types from protobuf files."
    exit 1
fi
