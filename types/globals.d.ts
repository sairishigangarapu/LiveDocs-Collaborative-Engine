import { User } from "./types"

declare global {
    type CustomJwtSessionClaims = User
}