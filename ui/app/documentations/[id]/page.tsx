"use client";

import { Button } from "@nextui-org/button";
import Table from "./components/table";
import H2 from "@/components/h2";
import PrimaryBtn from "@/components/primary_btn";
import Form from "../components/form";
import { Modal } from "antd";
import { useDocumentation } from "@/data/swr/documentations";
import Spinner from "@/components/icons/spinner";
import RightArrowIcon from "@/components/icons/right_arrow";

export default function Page({ params }: { params: { id: string } }) {
    const documentationId = params.id;
    const { data, isLoading } = useDocumentation(documentationId as any);

    if (isLoading) {
        return <Spinner />;
    }
    return (
        <>
            <div className="flex justify-between items-center pb-5">
                <H2>{data?.title}</H2>
                <PrimaryBtn text="Add a page"
                    icon={<RightArrowIcon />}
                    onClick={() => null} />

            </div>

            {/* <Table onRowEdit={null} />

            <Modal open={null} footer={null} onCancel={null}>
                <Form docId={null} postSubmit={null} />
            </Modal> */}

        </>
    );
}