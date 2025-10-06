import { Liveblocks } from '@liveblocks/node'

const secretKey = process.env.LIVEBLOCKS_SECRET_KEY || process.env.LIVEBLOCKS_PRIVATE_KEY;

if (!secretKey) {
    throw new Error("LIVEBLOCKS_SECRET_KEY (or LIVEBLOCKS_PRIVATE_KEY) is not set");
}

const liveblocks = new Liveblocks({
    secret: secretKey,
})

export default liveblocks