import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dynamoQueries } from "@/lib/dynamo-client";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  Box,
} from "lucide-react";
import debounce from "lodash/debounce";
import { parseTestChannelCombination } from "@/lib/dynamo-utils";
import { TestChannelCombination } from "@/types/dynamo-types";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 30;

const TestChannelTable = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [testIdInput, setTestIdInput] = useState("");
  const [channelIdInput, setChannelIdInput] = useState("");
  const [testIdSearch, setTestIdSearch] = useState("");
  const [channelIdSearch, setChannelIdSearch] = useState("");

  const router = useRouter();

  const handleRowClick = (testId: string, channelId: string) => {
    router.push(`/vis?testId=${testId}&channelId=${channelId}`);
  };

  // Create stable debounced search function
  const debouncedSearch = useCallback(
    debounce(async (testId: string, channelId: string) => {
      // Invalidate previous results before setting new search terms
      await queryClient.invalidateQueries({
        queryKey: ["testChannelCombinations"],
      });

      setTestIdSearch(testId);
      setChannelIdSearch(channelId);
      setCurrentPage(1);
    }, 500),
    [queryClient]
  );

  const {
    data: allItems = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["testChannelCombinations", testIdSearch, channelIdSearch],
    queryFn: () =>
      dynamoQueries.getAllTestChannelCombinations({
        filters: {
          testId: testIdSearch || undefined,
          channelId: channelIdSearch || undefined,
        },
      }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const handleTestIdInputChange = (value: string) => {
    setTestIdInput(value);
    debouncedSearch(value, channelIdInput);
  };

  const handleChannelIdInputChange = (value: string) => {
    setChannelIdInput(value);
    debouncedSearch(testIdInput, value);
  };

  const clearFilters = useCallback(() => {
    // Cancel any pending debounced searches
    debouncedSearch.cancel();

    // Clear the cache before resetting states
    queryClient.removeQueries({
      queryKey: ["testChannelCombinations"],
    });

    // Clear all input and search states
    setTestIdInput("");
    setChannelIdInput("");
    setTestIdSearch("");
    setChannelIdSearch("");
    setCurrentPage(1);

    // Trigger a new search with empty filters
    debouncedSearch("", "");
  }, [debouncedSearch, queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      queryClient.removeQueries({
        queryKey: ["testChannelCombinations"],
      });
    };
  }, [debouncedSearch, queryClient]);

  // Sort data
  const sortedAndFilteredData = useMemo(() => {
    // Create a map to store the latest entry for each Test/Channel combination
    const latestEntries = new Map<string, TestChannelCombination>();

    // Process all items to keep only the latest entry for each combination
    allItems.forEach((item) => {
      const { testId, channelId } = parseTestChannelCombination(item);
      const key = `${testId}#${channelId}`;

      if (
        !latestEntries.has(key) ||
        new Date(item.UpdatedAt) > new Date(latestEntries.get(key)!.UpdatedAt)
      ) {
        latestEntries.set(key, item);
      }
    });

    // Convert map values back to array and sort
    return Array.from(latestEntries.values()).sort((a, b) => {
      const aData = parseTestChannelCombination(a);
      const bData = parseTestChannelCombination(b);
      // First sort by test ID
      const testIdCompare = bData.testId.localeCompare(aData.testId);
      if (testIdCompare !== 0) return testIdCompare;
      // Then by channel ID
      return bData.channelId.localeCompare(aData.channelId);
    });
  }, [allItems]);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedAndFilteredData.slice(startIndex, endIndex);
  }, [sortedAndFilteredData, currentPage]);

  const handleNextPage = () => {
    if (
      currentPage < Math.ceil(sortedAndFilteredData.length / ITEMS_PER_PAGE)
    ) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700">Error loading data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{(error as Error)?.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Test Channel Combinations</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Test ID..."
                className="pl-8 w-[200px]"
                value={testIdInput}
                onChange={(e) => handleTestIdInputChange(e.target.value)}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Channel ID..."
                className="pl-8 w-[200px]"
                value={channelIdInput}
                onChange={(e) => handleChannelIdInputChange(e.target.value)}
              />
            </div>
            {(testIdInput || channelIdInput) && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearFilters}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test ID</TableHead>
                <TableHead>Channel ID</TableHead>
                <TableHead>Full Key</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No combinations found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => {
                  const { testId, channelId, fullKey } =
                    parseTestChannelCombination(item);
                  return (
                    <TableRow
                      key={item.GSI1SK}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>{testId}</TableCell>
                      <TableCell>{channelId}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {fullKey}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/vis?testId=${testId}&channelId=${channelId}`
                              );
                            }}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            2D Plots
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/visualization?testId=${testId}&channelId=${channelId}`
                              );
                            }}
                          >
                            <Box className="h-4 w-4 mr-2" />
                            3D View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {sortedAndFilteredData.length > 0 ? (
              <>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  sortedAndFilteredData.length
                )}{" "}
                of {sortedAndFilteredData.length} results
              </>
            ) : (
              "No results found"
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={
                currentPage >=
                Math.ceil(sortedAndFilteredData.length / ITEMS_PER_PAGE)
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestChannelTable;
