"use client";

import { Button } from "@nextui-org/button";
import Table from "./components/table";
import H2 from "@/components/h2";
import PrimaryBtn from "@/components/primary_btn";
import Form from "./components/form";
import { Modal } from "antd";
import { useDocumentation } from "@/data/swr/documentations";
import Spinner from "@/components/icons/spinner";
import RightArrowIcon from "@/components/icons/right_arrow";
import { useState } from "react";
import { usePages } from "@/data/swr/pages";
import CopyIcon from "@/components/icons/copy_icon";
import { Tooltip } from "@nextui-org/tooltip"
import ImportForm from "../components/import_form";
import ImportIcon from "@/components/icons/import_icon";

export default function Page({ params }: { params: { id: string } }) {
    const documentationId = params.id;
    const { data: documentationData } = useDocumentation(documentationId as any);
    const { data: pagesData, isLoading } = usePages(documentationId as any);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [activePage, setActivePage] = useState<null | string>(null);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setActivePage(null);
    };
    const handleAddClick = () => {
        console.log('Add a page');
        setActivePage(null);
        showModal();
    };
    const handleEditClick = (id: string) => {
        console.log('Edit documentation', id);
        setActivePage(id);
        showModal();
    };

    const handleImportModalCancel = () => {
        setImportModalOpen(false);
    }
    const handleImportClick = () => {
        setImportModalOpen(true);
    }


    if (isLoading) {
        return <Spinner />;
    }
    return (
        <>
            <div className="flex justify-between items-center pb-5">
                <div className="inline-flex space-x-1 items-center">
                    <H2>{documentationData?.title}</H2>
                </div>
                <div className="inline-flex space-x-1">
                    <Tooltip content="Import data (JSON)" placement="left" offset={-10}>
                        <button className=" text-slate-400 px-3 py-2 hover:text-slate-700"
                            onClick={handleImportClick}>
                            <ImportIcon />
                        </button>
                    </Tooltip>

                    <PrimaryBtn text="Add a page"
                        icon={<RightArrowIcon />}
                        onClick={handleAddClick} />
                </div>

            </div>

            <div>
                <p className="mb-5 text-gray-500 dark:text-gray-400">{documentationData?.description}</p>
            </div>

            <Table documentationId={documentationId} onRowEdit={handleEditClick} />
            <Modal open={isModalOpen} footer={null} onCancel={handleCancel}>
                <Form documentationId={documentationId}
                    pageId={activePage}
                    postSubmit={() => setIsModalOpen(false)} />
            </Modal>

            <Modal open={isImportModalOpen} footer={null} onCancel={handleImportModalCancel}>
                <ImportForm />
            </Modal>
        </>
    );
}