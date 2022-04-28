import Head from "next/head";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Configuration, Session, V0alpha2Api } from "@ory/client";
import { edgeConfig } from "@ory/integrations/next";
import { useState, useEffect } from "react";
import { NavBar } from "../components/NavBar";

export default function Home() {
  const [session, setSession] = useState();
  const [logoutUrl, setLogoutUrl] = useState();
  const [error, setError] = useState();

  const kratos = new V0alpha2Api(new Configuration(edgeConfig));

  useEffect(() => {
    // If the session or error have been loaded, do nothing.
    if (session || error) {
      return;
    }

    // Try to load the session.
    kratos
      .toSession()
      .then(({ data: session }) => {
        // Session loaded successfully! Let's set it.
        setSession(session);

        // Since we have a session, we can also get the logout URL.
        return kratos
          .createSelfServiceLogoutFlowUrlForBrowsers()
          .then(({ data }) => {
            setLogoutUrl(data.logout_url);
          });
      })
      .catch((err) => {
        // An error occurred while loading the session or fetching
        // the logout URL. Let's show that!
        setError({
          error: err.toString(),
          data: err.response?.data,
        });
      });
  }, [session, error]);

  const JsonRenderer = dynamic(() => import("../components/JsonRenderer"), {
    ssr: false,
  });

  return (
    <>
      <NavBar session={session} logoutUrl={logoutUrl} />
      <Head>
        <title>Ory NextJS Demo</title>
        <meta name="description" content="Ory NextJS Demo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"mx-10"}>
        {session ? (
          <>
            <div className={"flex flex-row justify-between"}>
              <p
                className={
                  "my-8 text-5xl lg:text-3xl font-bold tracking-tight text-gray-900"
                }
              >
                User Information
              </p>
              <a
                className="my-8 py-3 px-6 border-solid border-2"
                href={"/api/.ory/self-service/settings/browser"}
              >
                Update your settings
              </a>
            </div>
            <JsonRenderer
              src={session}
              name={null}
              enableClipboard={false}
              displayObjectSize={false}
              displayDataTypes={false}
              iconStyle="square"
              theme="monokai"
            />
          </>
        ) : (
          <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
            <div className="max-w-xl sm:mx-auto lg:max-w-2xl">
              <div className="flex flex-col mb-16 sm:text-center sm:mb-0">
                <div className="max-w-xl mt-40 mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
                  <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
                    <span className="relative inline-block">
                      <svg
                        viewBox="0 0 52 24"
                        fill="currentColor"
                        className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
                      >
                        <defs>
                          <pattern
                            id="e77df901-b9d7-4b9b-822e-16b2d410795b"
                            x="0"
                            y="0"
                            width=".135"
                            height=".30"
                          >
                            <circle cx="1" cy="1" r=".7"></circle>
                          </pattern>
                        </defs>
                        <rect
                          fill="url(#e77df901-b9d7-4b9b-822e-16b2d410795b)"
                          width="52"
                          height="24"
                        ></rect>
                      </svg>
                      <span className="relative">Ory</span>
                    </span>{" "}
                    Kretos Authentication
                  </h2>
                  <p className="text-base text-gray-700 md:text-lg">
                    Sample demo application to test Ory based authenticattion
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
