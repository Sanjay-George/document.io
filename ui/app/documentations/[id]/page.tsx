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

export default function Page({ params }: { params: { id: string } }) {
    const documentationId = params.id;
    const { data: documentationData } = useDocumentation(documentationId as any);
    const { data: pagesData, isLoading } = usePages(documentationId as any);

    const [isModalOpen, setIsModalOpen] = useState(false);
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

    if (isLoading) {
        return <Spinner />;
    }
    return (
        <>
            <div className="flex justify-between items-center pb-5">
                <H2>{documentationData?.title}</H2>
                <PrimaryBtn text="Add a page"
                    icon={<RightArrowIcon />}
                    onClick={handleAddClick} />

            </div>

            <Table documentationId={documentationId} onRowEdit={handleEditClick} />

            <Modal open={isModalOpen} footer={null} onCancel={handleCancel}>
                <Form documentationId={documentationId}
                    pageId={activePage}
                    postSubmit={() => setIsModalOpen(false)} />
            </Modal>

        </>
    );
}