"use client"

import React from 'react';
import ErrorPage from "@/app/error";

const Page = () => {
    return (
        <div>
            <ErrorPage error={new Error("Preview")} reset={() => window.location.reload()}/>
        </div>
    );
};

export default Page;
