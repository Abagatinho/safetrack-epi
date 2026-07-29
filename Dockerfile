# ===========================================================================
# safetrack-epi — Next.js 16, runs as a LAMBDA via the Lambda Web Adapter.
#
# WHY THIS IMAGE IS NOT LOCK-IN:
# The Lambda Web Adapter is a single binary copied into the image that translates
# a Lambda invocation into an ordinary HTTP request against `next start`. The
# application has NO IDEA it is in Lambda. Delete the two LWA lines and this same
# image runs on Fargate, on Fly.io, or on the app node. See LOCK-IN-LEDGER.md.
#
# WHY THIS APP IS ISOLATED IN LAMBDA AT ALL (ADR-0002):
# It has zero authentication and public POST endpoints, and it needs no database
# and no VPC. Biggest attack surface, smallest network need. Keeping it off the
# box that holds patient health data is the point. The US$0 cost is a bonus.
# ===========================================================================

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `npm run seed` writes data/db.json — the "database". It MUST run at build time:
# in Lambda the filesystem is read-only, lib/db.ts catches EROFS and falls back
# to an in-memory clone of the seed (lib/db.ts:39-53). Every cold start therefore
# restarts from this file. That is intentional for a demo (README says so), and
# it means writes never persist. Do not deploy this expecting a database.
RUN npm run seed && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# The Lambda Web Adapter. Two lines, and they are the only Lambda-specific
# thing in the entire image.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

# output: 'standalone' setado em next.config.ts (SAF-01).
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/data ./data

EXPOSE 3000

# ⚠️ HOST HEADER GOTCHA.
# lib/api.ts:1-12 builds an ABSOLUTE base URL from the incoming `host` header
# (via next/headers) so Server Components can fetch their own /api routes. If
# CloudFront rewrites Host to the origin domain, those server-side fetches go to
# the wrong place and every page breaks with an opaque fetch error.
#
# The CloudFront distribution uses the Managed-AllViewer origin request policy,
# which PRESERVES the viewer's Host header. If you ever change that policy, this
# app is the first thing that breaks — and it will not be obvious why.

CMD ["node", "server.js"]
