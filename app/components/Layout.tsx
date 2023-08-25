import Header  from "@/globals/Header";
import Head from "next/head";

export default function Layout({title, keywords, description, hideHeader, children}: any) {
    return(
        <div>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords}/>
            </Head>
             {/* {hideHeader !== true &&<Header />} */}

            {children}
        </div>
    )
}

Layout.defaultProps = {
    title: "Lucky Quit - Quit smoking forever",
    description: "Find the best Coaches to quit smoking, also keep track of the cigarettes you smoke, your health and the money you spent",
    keywords:"quit smoking, counter of cigarettes, earn money coach, track of cigarettes"
}