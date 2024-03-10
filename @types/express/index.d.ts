export {};

declare global {
	namespace Express {
		export interface Request {
			user?: any;
			admin?: any;
			query?: any;
		}
	}
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string;
			PORT: string;
			SSL: string;
			JWTSECRET: string;
			JWT_EXPIRY_TIME: string;
			DBNAME: string;
			DBUSERNAME: string;
			DBPASSWORD: string;
			DBHOST: string;
			DBPORT: string;
			DBDIALECT: string;
			MAIL_FROM: string;
			SUPPORT_MAIL: string;
			SUPPORT_PHONE: string;
			MAIL_FROM_NAME: string;
			LOGO: string;
			WEBSITE: string;
			BASE_API_URL: string;
			SENDGRID_API_KEY: string;
			TWILLIO_ACCOUNT_SID: string;
			TWILLIO_AUTH_TOKEN: string;
			TWILLIO_MESSAGE_SERVICE_ID: string;
			FLUTTERWAVE_BASE_API_URL: string;
			FLUTTERWAVE_SEC_KEY: string;
			FLUTTERWAVE_PUB_KEY: string;
			FLUTTERWAVE_VERIF_HASH: string;
			SPACES_SECRETKEY: string;
			SPACES_ACCESSKEY: string;
			SPACES_REGION: string;
			SPACES_ENDPOINT: string;
			SPACES_CDN_ENDPOINT: string;
			NIBSS_BASE_API_URL: string;
			NIBBS_NIP_SERVICE_ENDPOINT: string;
			NIBBS_MANDATE_MGT_ENDPOINT: string;
			NIBBS_GRANT_TYPE: string;
			NIBSS_CLIENT_SECRET: string;
			NIBSS_CLIENT_ID: string;
			NIBSS_MANDATE_CLIENT_SECRET: string;
			NIBSS_MANDATE_CLIENT_ID: string;
			NIBSS_SCOPE: string;
			NIBSS_INSTITUTION_CODE: string;
			NIBSS_NIP_PERMITTED_IP: string;
			PUBLIC_ROUTES: string;
			BUSINESS_PUBLIC_ROUTES: string;
			REDIS_INSTANCE_URL: string;
			IDENTITYPASS_LIVE_BASE_URL: string;
			IDENTITYPASS_SANDBOX_BASE_URL: string;
			IDENTITYPASS_X_API_KEY: string;
			IDENTITYPASS_APP_ID: string;
			CREDIT_REGISTRY_BASE_API_URL: string;
			CREDIT_REGISTRY_AGENT_EMAIL: string;
			CREDIT_REGISTRY_AGENT_PASSWORD: string;
			CREDIT_REGISTRY_AGENT_SUBSCRIBER_ID: string;
			SF_WALLET_BASE_API_URL: string;
			SF_WALLET_SEC_KEY: string;
			SF_WALLET_EMAIL: string;
			BLOCHQ_SECRET_KEY: string,
			BLOCHQ_BASE_API_URL: string,
			VTPASS_USERNAME: string;
			VTPASS_PASSWORD: string;
			VTPASS_API_KEY: string;
			VTPASS_PUB_KEY: string;
			VTPASS_SEK_KEY: string;
			VTPASS_SANDBOX_BASE_API_URL: string;
			VTPASS_BASE_URL: string;
			IP_API_URL: string;
			AWS_SECRETKEY: string;
			AWS_ACCESSKEY: string;
			AWS_BUCKETNAME: string;
			AWS_ACL: string;
			AWS_REGION: string;
		}
	}
}
