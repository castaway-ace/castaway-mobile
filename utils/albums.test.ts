import { makeAlbumTrack } from "@/test-utils/fixtures";
import { groupTracksByDisc } from "@/utils/albums";

describe("groupTracksByDisc", () => {
  it("returns a single group for a single-disc album", () => {
    const tracks = [
      makeAlbumTrack({ id: "t1", discNumber: 1 }),
      makeAlbumTrack({ id: "t2", discNumber: 1 }),
    ];

    const groups = groupTracksByDisc(tracks);

    expect(groups).toHaveLength(1);
    expect(groups[0].discNumber).toBe(1);
    expect(groups[0].tracks.map((entry) => entry.track.id)).toEqual([
      "t1",
      "t2",
    ]);
  });

  it("splits tracks into ordered disc sections", () => {
    const tracks = [
      makeAlbumTrack({ id: "t1", discNumber: 1 }),
      makeAlbumTrack({ id: "t2", discNumber: 1 }),
      makeAlbumTrack({ id: "t3", discNumber: 2 }),
      makeAlbumTrack({ id: "t4", discNumber: 2 }),
    ];

    const groups = groupTracksByDisc(tracks);

    expect(groups.map((group) => group.discNumber)).toEqual([1, 2]);
    expect(groups[1].tracks.map((entry) => entry.track.id)).toEqual([
      "t3",
      "t4",
    ]);
  });

  it("preserves each track's original flat index", () => {
    const tracks = [
      makeAlbumTrack({ id: "t1", discNumber: 1 }),
      makeAlbumTrack({ id: "t2", discNumber: 1 }),
      makeAlbumTrack({ id: "t3", discNumber: 2 }),
      makeAlbumTrack({ id: "t4", discNumber: 2 }),
    ];

    const groups = groupTracksByDisc(tracks);

    // The first track of disc 2 keeps its position (2) in the flat album list.
    expect(groups[1].tracks[0].index).toBe(2);
    expect(groups[1].tracks[1].index).toBe(3);
  });

  it("sorts discs ascending even when the backend returns them out of order", () => {
    const tracks = [
      makeAlbumTrack({ id: "t1", discNumber: 2 }),
      makeAlbumTrack({ id: "t2", discNumber: 1 }),
    ];

    const groups = groupTracksByDisc(tracks);

    expect(groups.map((group) => group.discNumber)).toEqual([1, 2]);
    // Indices still address the original flat array.
    expect(groups[0].tracks[0].index).toBe(1);
    expect(groups[1].tracks[0].index).toBe(0);
  });

  it("treats a missing disc number as disc 1", () => {
    const tracks = [
      makeAlbumTrack({ id: "t1", discNumber: undefined as unknown as number }),
    ];

    const groups = groupTracksByDisc(tracks);

    expect(groups).toHaveLength(1);
    expect(groups[0].discNumber).toBe(1);
  });

  it("returns no groups for an empty track list", () => {
    expect(groupTracksByDisc([])).toEqual([]);
  });
});
