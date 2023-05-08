import { Dispatch, SetStateAction } from "react";

export type MutState<T> = [ T, Dispatch<SetStateAction<T>> ];