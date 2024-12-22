import type { Handle, HandleFetch, HandleClientError, HandleServerError } from '@sveltejs/kit';
import { themeScript } from '$lib/stores/theme'; // adjust path as needed

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  return fetch(request);
};

export const handleServerError: HandleServerError = async ({ error, event }) => {
  return {
    message: 'Whoops - server error!'
  };
};

export const handleClientError: HandleClientError = async ({ error, event }) => {
  return {
    message: 'Whoops - client error!'
  };
};


export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      if (html.includes('</head>')) {
        return html.replace(
          '</head>',
          `<script>${themeScript}</script></head>`
        );
      }
      return html;
    }
  });
  return response;
};
