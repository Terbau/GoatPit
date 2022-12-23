/// <reference types="lucia-auth" />
declare namespace Lucia {
	type Auth = import('$lib/server/lucia.js').Auth;
	type UserAttributes = {
		email: string;
		provider: string;
		createdAt: Date;
	};
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
/// <reference types="@sveltejs/kit" />
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
	interface Error {
		message?: string;
		field?: string;
		alert?: boolean;
		alertMessage?: string;
	}

	interface Locals {
		validate: import('@lucia-auth/sveltekit').Validate;
		validateUser: import('@lucia-auth/sveltekit').ValidateUser;
		setSession: import('@lucia-auth/sveltekit').SetSession;
	}
}

declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
			onclickoutside?: (event: CustomEvent<number> & { target: EventTarget & T }) => any;
	}
}
