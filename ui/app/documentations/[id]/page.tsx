"use client";

import { MDXEditor, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin } from '@mdxeditor/editor';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Divider } from "@nextui-org/divider";


import '@mdxeditor/editor/style.css'
import Link from 'next/link';
import H2 from '@/components/H2';
import ButtonPrimary from '@/components/ButtonPrimary';
import { useDocumentation } from '@/data_access/swr/documentations';
import Spinner from '@/components/icons/spinner';
import RightArrowIcon from '@/components/icons/right_arrow';

export default function DocumentationDetails({ params }: { params: { id: string } }) {
    const documentationId = params.id;

    const { data: documentation, isLoading } = useDocumentation(documentationId as any);

    if (isLoading) {
        return <Spinner />;
    }
    return (
        <div className="">

            <PanelGroup direction="horizontal"
                className='fixed top-0 left-0'
                style={{ minHeight: '100%', width: '100vw', }}
            >
                <Panel className="px-7 py-5 w-full min-h-full bg-slate-50 overflow-scroll" defaultSize={25}>
                    <H2>{documentation?.title}</H2>

                    <Divider className='mb-10 bg-slate-200' />

                    <div className='max-w-xl'>
                        <MDXEditor
                            className='my-5 shadow-md rounded-xl bg-white'
                            markdown="Hello world"
                            plugins={[
                                toolbarPlugin({
                                    toolbarClassName: 'my-classname',
                                    toolbarContents: () => (
                                        <>
                                            {' '}
                                            <UndoRedo />
                                            <BoldItalicUnderlineToggles />
                                        </>
                                    )
                                })
                            ]}
                        />
                        <ButtonPrimary text="Save" icon={<RightArrowIcon />} />


                        <Card className="my-5 shadow-md rounded-xl" shadow='md'>
                            <CardHeader className="flex gap-3">
                                <Image
                                    alt="nextui logo"
                                    height={40}
                                    radius="sm"
                                    src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                                    width={40}
                                />
                                <div className="flex flex-col">
                                    <p className="text-md">NextUI</p>
                                    <p className="text-small text-accent">nextui.org</p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <p>Make beautiful websites regardless of your design experience.</p>
                            </CardBody>
                            <Divider />
                            <CardFooter>
                                <Link
                                    className='text-slate-400'
                                    href="https://github.com/nextui-org/nextui"
                                >
                                    Visit source code on GitHub.
                                </Link>
                            </CardFooter>
                        </Card>

                        <ButtonPrimary text="Add" icon={<RightArrowIcon />} />

                        <p className='text-sm font-light text-slate-400 mt-16 text-center border-1 border-slate-200 px-5 py-5 rounded-xl shadow-sm'>Select an element to annotate it. <br />Or select an annotated element to view the annotation.</p>

                    </div>


                </Panel>

                <PanelResizeHandle className="w-1.5 h-full bg-slate-200 hover:bg-slate-300 transition-background duration-150" />

                <Panel className='px-2 py-2 w-full h-full bg-slate-50'>
                    <iframe src={documentation.url} style={{ width: '100%', height: '100%' }}></iframe>
                </Panel>
            </PanelGroup>

        </div>



    );
}
