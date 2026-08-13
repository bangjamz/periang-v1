<?php

namespace Tests\Unit;

use App\Enums\StatusGizi;
use App\Services\StatusGiziService;
use PHPUnit\Framework\TestCase;

class StatusGiziServiceTest extends TestCase
{
    private StatusGiziService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new StatusGiziService;
    }

    public function test_normal_when_close_to_median(): void
    {
        $hasil = $this->service->tentukan(12, 9.6, 75.7, 'L');

        $this->assertSame(StatusGizi::Normal, $hasil['status']);
    }

    public function test_buruk_when_weight_far_below_median(): void
    {
        $hasil = $this->service->tentukan(12, 6.0, 75.7, 'L');

        $this->assertSame(StatusGizi::Buruk, $hasil['status']);
    }

    public function test_pendek_when_height_far_below_median(): void
    {
        $hasil = $this->service->tentukan(24, 12.0, 75.0, 'P');

        $this->assertSame(StatusGizi::Pendek, $hasil['status']);
    }

    public function test_kurang_when_weight_mildly_below_median(): void
    {
        $hasil = $this->service->tentukan(12, 8.0, 75.7, 'L');

        $this->assertSame(StatusGizi::Kurang, $hasil['status']);
    }

    public function test_interpolates_between_reference_points(): void
    {
        $hasil = $this->service->tentukan(3, 5.5, 58.75, 'L');

        // Umur 3 bulan ada di tengah titik acuan 0 dan 6 bulan.
        $this->assertEqualsWithDelta(5.6, $hasil['berat_median_kg'], 0.05);
        $this->assertEqualsWithDelta(58.75, $hasil['tinggi_median_cm'], 0.05);
    }

    public function test_clamps_age_outside_zero_to_sixty_months(): void
    {
        $hasil = $this->service->tentukan(72, 18.3, 110.0, 'L');

        $this->assertSame(StatusGizi::Normal, $hasil['status']);
        $this->assertEqualsWithDelta(18.3, $hasil['berat_median_kg'], 0.01);
    }
}
